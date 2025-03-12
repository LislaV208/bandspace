// import { projectsService } from '$lib/services/projects';

import type { Database } from "$lib/database.types";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";



export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectWithUsers = Project & {
    projects_users: Database['public']['Tables']['projects_users']['Row'][]
};

interface LoadResult {
    data: ProjectWithUsers[];
}

export const load: PageServerLoad = async ({ locals: { supabase, user } }): Promise<LoadResult> => {
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