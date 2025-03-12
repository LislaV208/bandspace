import type { Database } from "$lib/database.types";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Stałe dla storage i ustawień
const STORAGE = {
    PROJECT_FILES_BUCKET: 'project_files',
    CACHE_CONTROL: '3600'
};

// Funkcja pomocnicza do generowania unikalnej nazwy pliku
function generateUniqueFileName(fileExt: string | undefined): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomString}.${fileExt}`;
}


export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectWithUsers = Project & {
    projects_users: Database['public']['Tables']['projects_users']['Row'][]
};

// interface LoadResult {
//     data: ProjectWithUsers[];
// }

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    // Pobranie projektu na podstawie sluga
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', params.projectSlug)
        .single();

    if (projectError) {
        console.error('Error fetching project:', projectError);
        throw projectError;
    }

    // Pobranie utworów dla projektu
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*, files(*)')
        .eq('project_id', project.id);

    if (error) {
        console.error('Error fetching tracks:', error);
        throw error;
    }

    console.log('Tracks:', tracks);

    return {
        project,
        tracks
    };
};

export const actions = {
    // Tworzenie nowego utworu - tylko rekord w bazie danych bez pliku
    create: async ({ request, locals: { supabase, user }, params }) => {


        // Odczytanie danych z formularza
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();
        const storagePath = formData.get('storagePath')?.toString();
        const fileName = formData.get('fileName')?.toString();


        console.log('Tworzenie nowego tracku: ', name);
        console.log('FormData:', formData);

        // Walidacja danych wejściowych
        if (!name) {
            throw error(400, { message: 'Song name is required' });
        }

        if (!projectId) {
            throw error(400, { message: 'No project id' });
        }

        if (!storagePath) {
            throw error(400, { message: 'No storage path' });
        }

        if (!fileName) {
            throw error(400, { message: 'No file name' });
        }

        let trackData: {
            created_at: string;
            id: number;
            name: string;
            project_id: number;
            slug: string;
            updated_at: string;
            uploaded_by: string;
        } | null = null;

        try {

            // 1. Tworzymy najpierw rekord utworu
            const trackInsertData = {
                name,
                project_id: parseInt(projectId),
                uploaded_by: user?.id,
            };

            const { data: trackDataResult, error: trackError } = await supabase
                .from('tracks')
                .insert([trackInsertData])
                .select()
                .single();

            if (trackError) {
                console.error('Error creating song:', trackError);
                throw error(500, { message: trackError.message });
            }

            trackData = trackDataResult;

            if (!trackData) {
                throw error(500, { message: 'Failed to create track record' });
            }

            console.log('Track record created');

            // 2. Dodajemy rekord w tabeli files
            const fileInsertData = {
                name: fileName,
                storage_path: storagePath,
                track_id: trackData.id,
                uploaded_by: user?.id ?? '',
            };

            const { data: fileData, error: fileError } = await supabase
                .from('files')
                .insert([fileInsertData])
                .select()
                .single();

            if (fileError) {
                console.error('Error creating file:', fileError);
                throw error(500, { message: fileError.message });
            }

            if (!fileData) {
                throw error(500, { message: 'Failed to create file record' });
            }

            console.log('File record created');
        } catch (e) {
            console.error('Unexpected error creating track record:', e);
            throw error(500, { message: 'An error occurred while creating track record' });
        }
        redirect(303, `/${params.projectSlug}/${trackData.slug}`);
    },

    // Usuwanie projektu
    delete: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        if (!id) {
            return { error: 'Project id is required' };
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', parseInt(id));

        if (error) {
            console.error('Error deleting project:', error);
            return { error: error.message };
        }

        return { success: true };
    }
} satisfies Actions;