import type { Database } from "$lib/database.types";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


type Track = Database['public']['Tables']['tracks']['Row'];
type NewTrack = Omit<Track, "id" | "slug" | "created_at">;

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    // Pobranie projektu na podstawie sluga
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', params.projectSlug)
        .single();

    if (projectError) {
        console.error(`Error fetching project in +page.server.ts [${params.projectSlug}]:`, projectError);
        throw projectError;
    }

    // Pobranie utworów dla projektu
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select()
        .eq('project_id', project.id);

    if (error) {
        console.error(`Error fetching tracks in +page.server.ts [${params.projectSlug}]:`, error);
        throw error;
    }

    console.log('Tracks:', tracks);

    return {
        project,
        tracks
    };
};

export const actions = {
    // Tworzenie nowego utworu
    create: async ({ request, locals: { supabase, user }, params }) => {

        const formData = await request.formData();

        const name = formData.get('name')?.toString();
        const file_name = formData.get('file_name')?.toString();
        const projectId = formData.get('project_id')?.toString();
        const storagePath = formData.get('storage_file_path')?.toString();

        if (!file_name) {
            throw error(400, { message: 'No file name' });
        }

        if (!projectId) {
            throw error(400, { message: 'No project id' });
        }

        if (!storagePath) {
            throw error(400, { message: 'No storage file path' });
        }

        //  2. dodanie rekordu w bazie danych
        const trackToCreate: NewTrack = {
            name: name ? name : file_name,
            project_id: parseInt(projectId),
            uploaded_by: user!.id,
            file_name: file_name,
            storage_file_path: storagePath,
        };

        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .insert([trackToCreate])
            .select()
            .single();

        if (!track || trackError) {
            throw error(500, { message: trackError.message });
        }

        // 3. przekierowanie do strony utworu
        redirect(303, `/${params.projectSlug}/${track.slug}`);

    },

    // Usuwanie utworu
    delete: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const id = formData.get('id')?.toString();

        console.log('usuwanie utworu');

        if (!id) {
            return { error: 'Track id is required' };
        }

        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .select('storage_file_path')
            .eq('id', parseInt(id))
            .single();

        console.log('pobrano track:', track);

        if (trackError || !track) {
            console.error('Error fetching track:', trackError);
            return { error: trackError.message };
        }

        console.log('usuwanie pliku z storage');

        // Usun plik z storage
        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('project_files')
            .remove([track.storage_file_path]);

        console.log('odpoiedz po usunieciu:', storageData, storageError);

        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            return { error: storageError.message };
        }

        console.log('usuwanie rekordu z bazy danych');

        const { error } = await supabase
            .from('tracks')
            .delete()
            .eq('id', parseInt(id));

        if (error) {
            console.error('Error deleting track:', error);
            return { error: error.message };
        }

        console.log('usunieto rekord z bazy danych');

        return { success: true };
    }
} satisfies Actions;