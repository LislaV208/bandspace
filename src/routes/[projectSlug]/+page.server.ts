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
        const file = formData.get('file') as File;
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();

        if (!file) {
            throw error(400, { message: 'File is required' });
        }

        if (!projectId) {
            throw error(400, { message: 'No project id' });
        }

        if (!file.name) {
            throw error(400, { message: 'File name is required' });
        }

        // Sanitize the file name for storage
        const storageFileName = file.name
            .replace(/\.[^.]+$/, "")          // Remove file extension
            .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsupported chars with underscore
            .replace(/\s+/g, "-")             // Replace spaces with underscore
            .toLowerCase();                    // Convert to lowercase for consistency


        const timestamp = new Date().toISOString().replace(/[:.]/g, "");


        // 1. zapisanie pliku do storage
        const storagePath = `${params.projectSlug}/${storageFileName}_${timestamp}`;
        const { error: storageError } = await supabase
            .storage
            .from('project_files')
            .upload(storagePath, file, {
                contentType: file.type,
            });



        if (storageError) {
            console.error(`Error uploading file in +page.server.ts [${params.projectSlug}]:`, storageError);
            throw error(500, { message: storageError.message });
        }

        //  2. dodanie rekordu w bazie danych
        const trackToCreate: NewTrack = {
            name: name ?? file.name,
            project_id: parseInt(projectId),
            uploaded_by: user!.id,
            file_name: file.name,
            storage_file_path: storagePath,
        };

        const { data: track, error: trackError } = await supabase
            .from('tracks')
            .insert([trackToCreate])
            .select()
            .single();

        if (!track || trackError) {
            // Usun plik z storage w razie niepowodzenia
            await supabase
                .storage
                .from('project_files')
                .remove([storagePath]);

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