import type { Database } from "$lib/database.types";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Stałe dla storage i ustawień
const STORAGE = {
    PROJECT_FILES_BUCKET: 'project_files',
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
    // Utworzenie rekordów w bazie danych po uploadzie pliku
    saveTracksAndFile: async ({ request, locals: { supabase, user }, params }) => {
        // Odczytanie danych z formularza
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();
        const filePath = formData.get('filePath')?.toString();
        const fileName = formData.get('fileName')?.toString();
        const fileSize = formData.get('fileSize')?.toString();
        const fileUrl = formData.get('fileUrl')?.toString();
        const fileType = formData.get('fileType')?.toString();
        const duration = formData.get('duration')?.toString() || '180'; // Domyślnie 3 minuty

        console.log('Tworzenie rekordów w bazie danych po uploadzie:', name, filePath);

        // Walidacja danych wejściowych
        if (!name || !projectId || !filePath || !fileName || !fileSize || !fileUrl) {
            throw error(400, { message: 'Brakujące dane wymagane do utworzenia rekordów' });
        }

        let trackData, fileData;

        try {
            // 1. Tworzymy rekord utworu
            const trackSlug = name.toLowerCase().replace(/\s+/g, '-');
            const trackInsertData = {
                name,
                project_id: parseInt(projectId),
                uploaded_by: user?.id,
                slug: trackSlug,
            };

            const { data: insertedTrackData, error: trackError } = await supabase
                .from('tracks')
                .insert([trackInsertData])
                .select()
                .single();

            if (trackError) {
                console.error('Błąd podczas tworzenia rekordu track:', trackError);
                throw error(500, { message: trackError.message || 'Błąd podczas tworzenia utworu' });
            }

            if (!insertedTrackData) {
                throw error(500, { message: 'Nie udało się utworzyć rekordu utworu' });
            }

            trackData = insertedTrackData;
            console.log('Utworzono rekord track:', trackData);

            // 2. Tworzymy rekord pliku
            const fileInsertData = {
                name: fileName,
                track_id: trackData.id,
                file_url: fileUrl,
                size: parseInt(fileSize),
                duration: parseInt(duration),
                uploaded_by: user?.id || '',
            };

            const { data: insertedFileData, error: fileError } = await supabase
                .from('files')
                .insert([fileInsertData])
                .select()
                .single();

            if (fileError) {
                // W przypadku błędu przy tworzeniu rekordu pliku, usuwamy również utworzony wcześniej rekord utworu
                console.error('Błąd podczas tworzenia rekordu file:', fileError);
                await supabase.from('tracks').delete().eq('id', trackData.id);
                throw error(500, { message: fileError.message || 'Błąd podczas tworzenia rekordu pliku' });
            }

            if (!insertedFileData) {
                // Usuwamy utworzony wcześniej rekord utworu
                await supabase.from('tracks').delete().eq('id', trackData.id);
                throw error(500, { message: 'Nie udało się utworzyć rekordu pliku' });
            }

            fileData = insertedFileData;
            console.log('Utworzono rekord file:', fileData);

            return {
                success: true,
                data: {
                    trackId: trackData.id,
                    trackSlug: trackData.slug,
                    fileId: fileData.id,
                    fileUrl: fileData.file_url
                }
            };
        } catch (e) {
            console.error('Błąd podczas tworzenia rekordów po uploadzie:', e);

            // W przypadku błędu, próbujemy również usunąć plik z Supabase Storage
            if (filePath) {
                try {
                    await supabase.storage.from(STORAGE.PROJECT_FILES_BUCKET).remove([filePath]);
                    console.log('Usunięto plik z storage po niepowodzeniu zapisu do bazy:', filePath);
                } catch (storageError) {
                    console.error('Błąd podczas usuwania pliku z storage:', storageError);
                }
            }

            throw error(500, { message: e instanceof Error ? e.message : 'Wystąpił nieoczekiwany błąd podczas tworzenia rekordów' });
        }
    },

    // Tworzenie nowego utworu - tylko rekord w bazie danych bez pliku
    create: async ({ request, locals: { supabase, user }, params }) => {
        // Odczytanie danych z formularza
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const projectId = formData.get('project_id')?.toString();

        console.log('Tworzenie nowego tracku: ', name);

        // Walidacja danych wejściowych
        if (!name) {
            throw error(400, { message: 'Song name is required' });
        }

        if (!projectId) {
            throw error(400, { message: 'No project id' });
        }

        try {
            // Generujemy unikalną nazwę pliku już teraz
            const fileName = generateUniqueFileName('tmp'); // tymczasowe rozszerzenie
            const filePath = `${projectId}/${fileName}`;

            // 1. Tworzymy najpierw rekord utworu
            const trackInsertData = {
                name,
                project_id: parseInt(projectId),
                uploaded_by: user?.id,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
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

            if (!trackData) {
                throw error(500, { message: 'Failed to create track record' });
            }

            // Zwracamy dane utworzonego tracku, aby klient mógł użyć ich do bezpośredniego uploadu
            console.log('Track record created (waiting for client upload)');

            return {
                success: true,
                trackId: trackData.id,
                trackSlug: trackData.slug,
                filePath: filePath,
                bucket: STORAGE.PROJECT_FILES_BUCKET,
                cacheControl: STORAGE.CACHE_CONTROL
            };
        } catch (e) {
            console.error('Unexpected error creating track record:', e);
            throw error(500, { message: 'An error occurred while creating track record' });
        }
    },

    // Aktualizacja rekordu po zakończeniu uploadu pliku do Supabase Storage
    updateAfterUpload: async ({ request, locals: { supabase, user }, params }) => {
        const formData = await request.formData();
        const trackId = formData.get('trackId')?.toString();
        const filePath = formData.get('filePath')?.toString();
        const fileName = formData.get('fileName')?.toString();
        const fileSize = formData.get('fileSize')?.toString();
        const trackSlug = formData.get('trackSlug')?.toString();

        if (!trackId || !filePath || !fileName || !fileSize || !trackSlug) {
            throw error(400, { message: 'Missing required fields for update after upload' });
        }

        try {
            // Sprawdzamy czy plik istnieje w Supabase Storage
            const { data: fileExists, error: fileCheckError } = await supabase.storage
                .from(STORAGE.PROJECT_FILES_BUCKET)
                .list(filePath.split('/')[0], {
                    limit: 1,
                    offset: 0,
                    search: filePath.split('/')[1]
                });

            if (fileCheckError || !fileExists || fileExists.length === 0) {
                console.error('File not found in storage after direct upload', fileCheckError);
                throw error(500, { message: 'File not found in storage after upload' });
            }

            // Pobieramy publiczny URL do pliku
            const { data: publicUrlData } = await supabase.storage
                .from(STORAGE.PROJECT_FILES_BUCKET)
                .getPublicUrl(filePath);

            if (!publicUrlData) {
                console.error('Error generating file URL');
                throw error(500, { message: 'Error generating file URL' });
            }

            // Utworzenie rekordu pliku
            const fileInsertData = {
                name: fileName,
                track_id: trackId ? parseInt(trackId) : 0, // Upewniam się, że trackId jest konwertowany do liczby
                file_url: publicUrlData.publicUrl,
                size: fileSize ? parseInt(fileSize) : 0, // Upewniam się, że fileSize jest konwertowany do liczby
                duration: 0, // To będzie trzeba zaktualizować później
                uploaded_by: user?.id || ''
            };

            const { data: fileData, error: fileError } = await supabase
                .from('files')
                .insert(fileInsertData)
                .select()
                .single();

            if (fileError) {
                console.error('Error creating file record:', fileError);
                // Jeśli wystąpił błąd podczas zapisywania do bazy, usuwamy plik z Storage
                await supabase.storage.from(STORAGE.PROJECT_FILES_BUCKET).remove([filePath]);
                throw error(500, { message: fileError.message });
            }

            console.log('File record created after successful upload');
            redirect(303, `/${params.projectSlug}/${trackSlug}`);
        } catch (e) {
            console.error('Unexpected error updating after upload:', e);
            throw error(500, { message: 'An error occurred while updating after file upload' });
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