import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DashboardProject } from '$lib/types/project';
import type { Track } from '$lib/types/track';

/**
 * Endpoint GET do pobierania listy projektów użytkownika.
 * Zwraca listę projektów wraz z podstawowymi informacjami.
 */
export const GET: RequestHandler = async ({ locals: { supabase, user } }) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: 'Nieautoryzowany dostęp' });
  }

  try {
    // Pobieramy projekty użytkownika wraz z liczbą członków
    const { data, error: projectsError } = await supabase
      .from("projects")
      .select(
        `
          *,
          projects_users!inner(user_id),
          members_count:projects_users(count)
      `
      )
      .eq("projects_users.user_id", user.id);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      throw error(500, { message: projectsError.message });
    }

    // Przekształcamy members_count z tablicy [{ count: liczba }] na samą liczbę
    const transformedData = data.map((project) => ({
      ...project,
      members_count: project.members_count[0]?.count || 0,
      recent_tracks: [] as Track[], // Inicjalizujemy pustą tablicę dla utworów
      members: [], // Inicjalizujemy pustą tablicę dla członków projektu
    })) as DashboardProject[];

    // Dla każdego projektu pobieramy 3 ostatnie utwory
    for (const project of transformedData) {
      // Pobieramy utwory
      const { data: tracks, error: tracksError } = await supabase
        .from("tracks")
        .select()
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (tracksError) {
        console.error(
          `Error fetching tracks for project ${project.id}:`,
          tracksError
        );
        continue; // Kontynuujemy pętlę nawet jeśli wystąpi błąd dla jednego projektu
      }

      project.recent_tracks = tracks || [];

      // Pobieramy członków projektu
      const { data: members, error: membersError } = await supabase
        .from("projects_users")
        .select(`
          user:user_id(*)
        `)
        .eq("project_id", project.id)
        .limit(5);

      if (membersError) {
        console.error(
          `Error fetching members for project ${project.id}:`,
          membersError
        );
        continue;
      }

      // Przekształcamy dane członków projektu
      project.members = members.map((m) => m.user) || [];
    }

    return json(transformedData);
  } catch (err) {
    console.error('Error in GET /api/projects:', err);
    throw error(500, { message: 'Wystąpił błąd podczas pobierania projektów' });
  }
};

/**
 * Endpoint POST do tworzenia nowego projektu.
 * Przyjmuje nazwę projektu i tworzy nowy projekt.
 */
export const POST: RequestHandler = async ({ request, locals: { supabase, user } }) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: 'Nieautoryzowany dostęp' });
  }

  try {
    // Pobierz dane z żądania
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw error(400, { message: 'Nazwa projektu nie może być pusta' });
    }

    // Utwórz nowy projekt
    const { data, error: createError } = await supabase
      .from('projects')
      .insert([{ name: name.trim() }])
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating project:', createError);
      throw error(500, { message: createError.message });
    }

    return json({
      success: true,
      project: data
    });
  } catch (err) {
    console.error('Error in POST /api/projects:', err);
    throw error(500, { message: 'Wystąpił błąd podczas tworzenia projektu' });
  }
};
