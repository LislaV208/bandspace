import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {


    const { data: track, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('slug', params.recordingId)
        .single();

    if (error) {
        console.error('Error fetching tracks:', error);
        throw error;
    }

    console.log('Tracks:', track);

    return { track };
};