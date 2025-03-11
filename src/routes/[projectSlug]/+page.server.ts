import type { Database } from "$lib/database.types";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Stałe dla storage i ustawień
const STORAGE = {
    PROJECT_FILES_BUCKET: 'project-files',
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
    // Tworzenie nowego utworu z opcjonalnym plikiem audio
    create: async ({ request, locals: { supabase, user }, params }) => {
        // Odczytanie danych z formularza
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();
        const audioFile = formData.get('audio') as File;

        console.log('nowy song: ', name);

        // Walidacja danych wejściowych
        if (!name) {
            throw error(400, { message: 'Song name is required' });
        }

        if (!projectId) {
            throw error(400, { message: 'No project id' });
        }

        try {
            // 1. Tworzymy najpierw rekord utworu
            const trackInsertData = {
                name,
                project_id: parseInt(projectId),
                uploaded_by: user?.id,
            };

            const { data: trackData, error: trackError } = await supabase
                .from('tracks')
                .insert([trackInsertData])
                .select()
                .single();

            if (trackError) {
                console.error('Error creating song:', trackError);
                throw error(500, { message: trackError.message });
            }

            // Jeśli nie ma pliku, to kończymy
            if (!audioFile || audioFile.size === 0) {
                console.log('Song created (without file)');
                redirect(303, `/${params.projectSlug}/${trackData.slug}`);
            }

            // 2. Upload pliku do Storage
            const fileExt = audioFile.name.split('.').pop();
            const fileName = generateUniqueFileName(fileExt);
            const filePath = `${projectId}/${fileName}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from(STORAGE.PROJECT_FILES_BUCKET)
                .upload(filePath, audioFile, {
                    cacheControl: STORAGE.CACHE_CONTROL
                });

            if (storageError) {
                console.error('Error uploading file:', storageError);
                // Usuwamy utworzony wcześniej track, ponieważ upload pliku się nie powiódł
                await supabase.from('tracks').delete().eq('id', trackData.id);
                throw error(500, { message: storageError.message });
            }

            // Pobieramy publiczny URL do pliku
            const { data: publicUrlData } = await supabase.storage
                .from(STORAGE.PROJECT_FILES_BUCKET)
                .getPublicUrl(filePath);

            // 3. Zapisanie informacji o pliku w tabeli files
            const fileInsertData = {
                name: audioFile.name,
                track_id: trackData.id,
                file_url: publicUrlData.publicUrl,
                size: audioFile.size,
                duration: 0, // To będzie trzeba zaktualizować później - na razie domyślna wartość
                uploaded_by: user?.id || '' // Zapewniamy, że nawet jeśli user?.id jest undefined, to przekażemy pusty string
            };

            const { data: fileData, error: fileError } = await supabase
                .from('files')
                .insert(fileInsertData)
                .select()
                .single();

            if (fileError) {
                console.error('Error creating file record:', fileError);
                // Jeśli wystąpił błąd podczas zapisywania do bazy, usuwamy plik z Storage i utworzony track
                await supabase.storage.from(STORAGE.PROJECT_FILES_BUCKET).remove([filePath]);
                await supabase.from('tracks').delete().eq('id', trackData.id);
                throw error(500, { message: fileError.message });
            }

            console.log('Song created with file');
            redirect(303, `/${params.projectSlug}/${trackData.slug}`);
        } catch (e) {
            console.error('Unexpected error:', e);
            throw error(500, { message: 'An error occurred while uploading the file' });
        }
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