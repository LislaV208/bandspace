import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import type { DashboardProject } from "$lib/types/project";
import type { Track } from "$lib/types/track";

export const load: PageServerLoad = async ({
  locals: { supabase, user, session },
}) => {
  // Jeśli użytkownik nie jest zalogowany, zwracamy pusty obiekt
  if (!session) {
    return {};
  }

  // Pobieramy projekty użytkownika wraz z liczbą członków
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        *,
        projects_users!inner(user_id),
        members_count:projects_users(count)
    `
    )
    .eq("projects_users.user_id", user!.id);

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  // Przekształcamy members_count z tablicy [{ count: liczba }] na samą liczbę
  const transformedData = data.map((project) => ({
    ...project,
    members_count: project.members_count[0]?.count || 0,
    recent_tracks: [] as Track[], // Inicjalizujemy pustą tablicę dla utworów z właściwym typem
    members: [], // Inicjalizujemy pustą tablicę dla członków projektu
  })) as DashboardProject[];

  // Dla każdego projektu pobieramy 5 ostatnich utworów i członków projektu
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
    const { data: projectUsers, error: usersError } = await supabase
      .from("projects_users")
      .select(`user:users(*)`)
      .eq("project_id", project.id)
      .limit(6); // Pobieramy maksymalnie 6 członków (5 do wyświetlenia + 1 do liczenia pozostałych)

    if (usersError) {
      console.error(
        `Error fetching project users for project ${project.id}:`,
        usersError
      );
      continue;
    }

    project.members = projectUsers.map((pu) => pu.user);
  }

  return { data: transformedData };
};

export const actions = {
  // Akcje dla zalogowanych użytkowników
  create: async ({ request, locals: { supabase, session } }) => {
    // Sprawdzamy czy użytkownik jest zalogowany
    if (!session) {
      return fail(401, {
        error: "Musisz być zalogowany, aby utworzyć projekt",
      });
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString();

    if (!name) {
      throw error(400, { message: "Project name is required" });
    }

    const { data, error: dbError } = await supabase
      .from("projects")
      .insert([{ name }])
      .select("*")
      .single();

    if (dbError) {
      console.error("Error creating project:", dbError);
      throw error(500, { message: dbError.message });
    }

    redirect(303, `/${data.slug}`);
  },

  delete: async ({ request, locals: { supabase, session } }) => {
    // Sprawdzamy czy użytkownik jest zalogowany
    if (!session) {
      return fail(401, { error: "Musisz być zalogowany, aby usunąć projekt" });
    }

    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const slug = formData.get("slug")?.toString();
    if (!id || !slug) {
      throw error(400, { message: "Project id and slug are required" });
    }

    // 1. Pobierz listę wszystkich plików w storage
    const { data: filesList, error: listError } = await supabase.storage
      .from("project_files")
      .list(slug);

    if (listError) {
      console.error("Błąd podczas pobierania listy plików:", listError);
      throw error(500, { message: listError.message });
    }

    // 2. Utwórz tablicę ścieżek do plików
    const filePaths = filesList.map((file) => `${slug}/${file.name}`);

    // 3. Usuń wszystkie pliki jednocześnie
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("project_files")
        .remove(filePaths);

      if (storageError) {
        console.error("Błąd podczas usuwania plików:", storageError);
        throw error(500, { message: storageError.message });
      }
    }

    // 2. usun rekord z bazy danych
    const { error: dbError } = await supabase
      .from("projects")
      .delete()
      .eq("id", parseInt(id));
    if (dbError) {
      console.error("Error deleting project:", dbError);
      throw error(500, { message: dbError.message });
    }

    return { success: true };
  },

  // Akcje dla niezalogowanych użytkowników
  login: async ({ request, url, locals: { supabase } }) => {
    // Pobieramy parametr redirect z URL
    const redirectTo = url.searchParams.get("redirect") || "/dashboard";

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return fail(400, { error: "Email i hasło są wymagane" });
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail(401, { error: error.message });
    }

    // Przekierowujemy do wcześniej żądanej strony lub do dashboardu
    redirect(303, redirectTo);
  },

  register: async ({ request, url, locals: { supabase } }) => {
    // Pobieramy parametr redirect z URL
    const redirectTo = url.searchParams.get("redirect") || "/dashboard";

    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();

    if (!email || !password) {
      return fail(400, { error: "Email i hasło są wymagane" });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Podane hasła różnią się od siebie" });
    }

    // Używamy adresu email jako tymczasowej nazwy użytkownika
    // Użytkownik będzie mógł zaktualizować swoją nazwę później
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: email.split("@")[0], // Używamy części adresu email przed @ jako tymczasowej nazwy
        },
      },
    });

    if (error) {
      return fail(401, { error: error.message });
    }

    // Przekierowujemy do wcześniej żądanej strony lub do dashboardu
    redirect(303, redirectTo);
  },

  googleLogin: async ({ request, locals: { supabase } }) => {
    // Pobierz bazowy URL z aktualnego żądania
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // Dla Google OAuth nie przekazujemy parametru redirect w URL
    // Zamiast tego używamy localStorage (zaimplementowane w +page.svelte)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (error) {
      return fail(400, {
        message: "Wystąpił błąd podczas logowania Google",
      });
    }

    redirect(303, data.url);
  },
} satisfies Actions;
