import type { Database } from "$lib/database.types";
import type { Project } from "$lib/types/project";
import type { TrackFile, TrackFileCreate } from "$lib/types/track_file";
import type { User } from "$lib/types/user";
import { error, redirect, type Actions } from "@sveltejs/kit";
import file from "lucide-svelte/icons/file";
import type { PageServerLoad } from "./$types";

type Track = Database["public"]["Tables"]["tracks"]["Row"];
type NewTrack = Omit<Track, "id" | "slug" | "created_at">;

export const load: PageServerLoad = async ({
  locals: { supabase },
  params,
}) => {
  // Pobranie projektu na podstawie sluga
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", params.projectSlug)
    .single();

  if (projectError) {
    console.error(
      `Error fetching project in +page.server.ts [${params.projectSlug}]:`,
      projectError
    );
    throw projectError;
  }

  // Pobranie utworów dla projektu
  const { data: tracks, error } = await supabase
    .from("tracks")
    .select()
    .eq("project_id", project.id);

  if (error) {
    console.error(
      `Error fetching tracks in +page.server.ts [${params.projectSlug}]:`,
      error
    );
    throw error;
  }

  // Pobranie użytkowników przypisanych do projektu
  const { data: projectUsers, error: usersError } = await supabase
    .from("projects_users")
    .select(`user:users(*)`)
    .eq("project_id", project.id);

  if (usersError) {
    console.error(
      `Error fetching project users in +page.server.ts [${params.projectSlug}]:`,
      usersError
    );
    throw usersError;
  }

  console.log("Tracks:", tracks);
  console.log("Project users:", projectUsers);

  // Pobranie kategorii utworów
  const { data: categories, error: categoriesError } = await supabase
    .from("track_categories")
    .select();

  if (categoriesError) {
    console.error(
      `Error fetching categories in +page.server.ts [${params.projectSlug}]:`,
      categoriesError
    );
    throw categoriesError;
  }

  return {
    project: project as Project,
    tracks,
    categories,
    projectUsers: projectUsers.map((pu) => pu.user as User),
  };
};

export const actions = {
  // Usuwanie utworu
  deleteTrack: async ({ request, locals: { supabase }, params }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();

    console.log("usuwanie utworu");

    if (!id) {
      return { error: "Track id is required" };
    }

    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .select("storage_file_path")
      .eq("id", parseInt(id))
      .single();

    console.log("pobrano track:", track);

    if (trackError || !track) {
      console.error("Error fetching track:", trackError);
      return { error: trackError.message };
    }

    console.log("usuwanie pliku z storage");

    // Usun plik z storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("project_files")
      .remove([track?.storage_file_path ?? ""]);

    console.log("odpoiedz po usunieciu:", storageData, storageError);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      return { error: storageError.message };
    }

    console.log("usuwanie rekordu z bazy danych");

    const { error } = await supabase
      .from("tracks")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting track:", error);
      return { error: error.message };
    }

    console.log("usunieto rekord z bazy danych");
  },

  // Usuwanie projektu
  deleteProject: async ({ request, locals: { supabase }, params }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const slug = formData.get("slug")?.toString();

    if (!id || !slug) {
      return { error: "ID projektu i slug są wymagane" };
    }

    // 1. Pobierz listę wszystkich plików w storage dla projektu
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

    // 4. Usuń rekord projektu z bazy danych
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Błąd podczas usuwania projektu:", error);
      return { error: error.message };
    }

    // 5. Przekieruj na stronę główną po pomyślnym usunięciu
    redirect(303, "/");
  },
} satisfies Actions;
