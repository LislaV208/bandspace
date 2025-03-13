// import { projectsService } from '$lib/services/projects';

import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";





export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, projects_users!inner(*)')
        .eq('projects_users.user_id', user!.id);

    if (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }


    return { data };
};

export const actions = {
    create: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const name = formData.get('name')?.toString();


        if (!name) {
            return { error: 'Project name is required' };
        }

        const { data, error } = await supabase
            .from('projects')
            .insert([{ name }])
            .select('*')
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return { error: error.message };
        }

        redirect(303, `/${data.slug}`);
    },
    delete: async ({ request, locals: { supabase } }) => {

        const formData = await request.formData();
        const id = formData.get('id')?.toString();
        const slug = formData.get('slug')?.toString();
        if (!id || !slug) {
            return { error: 'Project id and slug are required' };
        }

        // 1. Pobierz listę wszystkich plików w storage
        const { data: filesList, error: listError } = await supabase
            .storage
            .from('project_files')
            .list(slug);

        if (listError) {
            console.error('Błąd podczas pobierania listy plików:', listError);
            return { error: listError.message };
        }

        // 2. Utwórz tablicę ścieżek do plików
        const filePaths = filesList.map(file => `${slug}/${file.name}`);

        // 3. Usuń wszystkie pliki jednocześnie
        if (filePaths.length > 0) {
            const { error: storageError } = await supabase
                .storage
                .from('project_files')
                .remove(filePaths);

            if (storageError) {
                console.error('Błąd podczas usuwania plików:', storageError);
                return { error: storageError.message };
            }
        }

        // 2. usun rekord z bazy danych
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