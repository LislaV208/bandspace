import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import type { Database } from "$lib/database.types";

// Typ dla utworu muzycznego na podstawie schematu bazy danych
type DbTrack = Database["public"]["Tables"]["tracks"]["Row"];

// Typ używany dla utworów w aplikacji
type Track = Pick<DbTrack, "id" | "name" | "created_at">;

// Baza projektu z bazy danych
type DbProject = Database["public"]["Tables"]["projects"]["Row"];

// Rozszerzony typ projektu z ostatnimi utworami
interface ProjectWithTracks extends DbProject {
  members_count: number;
  recent_tracks: Track[];
}

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
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
  })) as ProjectWithTracks[];

  // Dla każdego projektu pobieramy 5 ostatnich utworów
  for (const project of transformedData) {
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("id, name, created_at")
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
  }

  return { data: transformedData };
};

export const actions = {
  create: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();

    if (!name) {
      return { error: "Project name is required" };
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name }])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return { error: error.message };
    }

    redirect(303, `/${data.slug}`);
  },
  delete: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const slug = formData.get("slug")?.toString();
    if (!id || !slug) {
      return { error: "Project id and slug are required" };
    }

    // 1. Pobierz listę wszystkich plików w storage
    const { data: filesList, error: listError } = await supabase.storage
      .from("project_files")
      .list(slug);

    if (listError) {
      console.error("Błąd podczas pobierania listy plików:", listError);
      return { error: listError.message };
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
        return { error: storageError.message };
      }
    }

    // 2. usun rekord z bazy danych
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", parseInt(id));
    if (error) {
      console.error("Error deleting project:", error);
      return { error: error.message };
    }
    return { success: true };
  },
} satisfies Actions;
