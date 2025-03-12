import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
    // Pobieramy utwór wraz z powiązanym plikiem w jednym zapytaniu
    const { data, error } = await supabase
        .from('tracks')
        .select(`
            *,
            files!track_id(*)     
        `)
        .eq('slug', params.trackSlug)
        .single();

    if (error) {
        console.error('Error fetching track with file:', error);
        throw error;
    }

    const track = {
        ...data,
        files: undefined // Usuwamy tablicę files z obiektu track
    };

    // Pobieramy pierwszy plik z tablicy files (jeśli istnieje)
    const file = data.files && data.files.length > 0 ? data.files[0] : null;

    console.log('Track:', track);
    console.log('File:', file);

    return { track, file }
};