import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// interface BreadcrumbsData {
//     projectName: string;
//     recordingName: string | null;
// }

export const load: LayoutServerLoad = async ({ params, locals: { supabase } }) => {
    const projectSlug = params.projectId;
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('slug', projectSlug)
        .single();
    if (projectError) {
        console.error('Error fetching project:', projectError);
        throw error(500, 'Internal Server Error');
    }



    let recordingName = null;
    const recordingSlug = params.recordingId ?? null;
    if (recordingSlug) {
        const { data, error: fileError } = await supabase
            .from('tracks')
            .select('name')
            .eq('slug', recordingSlug)
            .single();
        if (fileError) {
            console.error('Error fetching file:', fileError);
            throw error(500, 'Internal Server Error');
        }

        recordingName = data.name;
    }

    return {
        project: {
            name: project.name,
            slug: projectSlug
        },
        recording: {
            name: recordingName,
            slug: recordingSlug
        }
    }
}; 