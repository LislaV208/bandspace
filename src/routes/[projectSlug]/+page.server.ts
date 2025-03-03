
import type { Database } from "$lib/database.types";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectWithUsers = Project & {
    projects_users: Database['public']['Tables']['projects_users']['Row'][]
};

// interface LoadResult {
//     data: ProjectWithUsers[];
// }

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', params.projectSlug)
        .single();



    if (projectError) {
        console.error('Error fetching project:', projectError);
        throw projectError;
    }

    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('project_id', project.id);

    if (error) {
        console.error('Error fetching tracks:', error);
        throw error;
    }

    console.log('Tracks:', tracks);

    return { tracks };
};

export const actions = {
    // create new project
    create: async ({ request, locals: { supabase, user } }) => {
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();

        console.log('nowy song: ', name);

        if (!name) {
            return { error: 'Song name is required' };
        }

        if (!projectId) {
            return { error: 'No project id' };
        }




        const { error } = await supabase
            .from('tracks')
            .insert([{
                name,
                project_id: parseInt(projectId),
                uploaded_by: user?.id,
            }]);

        if (error) {
            console.error('Error creating song:', error);
            return { error: error.message };
        }

        console.log('Song created');
        return { success: true };
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