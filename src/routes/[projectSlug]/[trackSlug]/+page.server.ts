import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {

    const { data: project, error: projectError } = await supabase.from('projects')
        .select('id, slug')
        .eq('slug', params.projectSlug)
        .single();

    if (projectError) {
        console.error('Error fetching track project:', projectError);
        throw projectError;
    }

    const { data: track, error } = await supabase.from('tracks')
        .select()
        .eq('project_id', project.id)
        .eq('slug', params.trackSlug)
        .single();

    if (error) {
        console.log('Error fetching track:', error);
        throw error;
    }

    return { track }
};