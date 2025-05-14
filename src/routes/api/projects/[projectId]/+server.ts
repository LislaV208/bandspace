import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Endpoint GET do pobierania szczegółów projektu.
 * Zwraca szczegółowe informacje o projekcie, jego członkach i utworach.
 */
export const GET: RequestHandler = async ({
  locals: { supabase, user },
  params,
}) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: "Nieautoryzowany dostęp" });
  }

  const projectId = params.projectId;
  if (!projectId || isNaN(parseInt(projectId))) {
    throw error(400, { message: "Nieprawidłowe ID projektu" });
  }

  try {
    // Sprawdź, czy użytkownik ma dostęp do projektu
    const { data: projectAccess, error: accessError } = await supabase
      .from("projects_users")
      .select("*")
      .eq("project_id", parseInt(projectId))
      .eq("user_id", user.id)
      .single();

    if (accessError || !projectAccess) {
      throw error(403, { message: "Nie masz dostępu do tego projektu" });
    }

    // Pobierz szczegóły projektu
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", parseInt(projectId))
      .single();

    if (projectError || !project) {
      throw error(404, { message: "Projekt nie został znaleziony" });
    }

    // Pobierz członków projektu
    const { data: members, error: membersError } = await supabase
      .from("projects_users")
      .select(
        `
        user:user_id(*)
      `
      )
      .eq("project_id", parseInt(projectId));

    if (membersError) {
      console.error(
        `Error fetching members for project ${projectId}:`,
        membersError
      );
      throw error(500, {
        message: "Błąd podczas pobierania członków projektu",
      });
    }

    // Pobierz utwory projektu
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("*")
      .eq("project_id", parseInt(projectId))
      .order("created_at", { ascending: false });

    if (tracksError) {
      console.error(
        `Error fetching tracks for project ${projectId}:`,
        tracksError
      );
      throw error(500, { message: "Błąd podczas pobierania utworów projektu" });
    }

    // Zwróć kompletne dane projektu
    return json({
      ...project,
      members: members.map((m) => m.user),
      tracks: tracks || [],
    });
  } catch (err) {
    console.error(`Error in GET /api/projects/${projectId}:`, err);
    throw error(500, { message: "Wystąpił błąd podczas pobierania projektu" });
  }
};

/**
 * Endpoint PATCH do aktualizacji projektu.
 * Obsługuje żądanie PATCH z nową nazwą projektu.
 */
export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  // Sprawdź czy użytkownik jest zalogowany
  const { user, supabase } = locals;

  if (!user || !supabase) {
    throw error(401, { message: "Nie jesteś zalogowany" });
  }

  const projectId = params.projectId;
  if (!projectId || isNaN(parseInt(projectId))) {
    throw error(400, { message: "Nieprawidłowe ID projektu" });
  }

  // Pobierz dane z żądania
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw error(400, { message: "Nieprawidłowy format danych" });
  }

  // Walidacja danych
  const { name, oldSlug } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw error(400, { message: "Nazwa projektu nie może być pusta" });
  }

  // Sprawdź, czy użytkownik ma dostęp do projektu
  const { data: projectAccess, error: accessError } = await supabase
    .from("projects_users")
    .select("*")
    .eq("project_id", parseInt(projectId))
    .eq("user_id", user.id)
    .single();

  if (accessError || !projectAccess) {
    throw error(403, { message: "Nie masz dostępu do tego projektu" });
  }

  // Aktualizacja nazwy projektu w bazie danych
  // Slug zostanie automatycznie zaktualizowany przez trigger w bazie danych
  const { data, error: updateError } = await supabase
    .from("projects")
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parseInt(projectId))
    .select()
    .single();

  if (updateError) {
    console.error("Błąd podczas aktualizacji projektu:", updateError);
    throw error(500, { message: updateError.message });
  }

  // Zwróć zaktualizowane dane
  return json({
    success: true,
    project: data,
    redirect: oldSlug && oldSlug !== data.slug ? `/${data.slug}` : null,
  });
};
export const DELETE: RequestHandler = async ({
  locals: { supabase, user },
  params,
}) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: "Nieautoryzowany dostęp" });
  }

  const projectId = params.projectId;
  if (!projectId || isNaN(parseInt(projectId))) {
    throw error(400, { message: "Nieprawidłowe ID projektu" });
  }

  try {
    // Pobierz informacje o projekcie
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", parseInt(projectId))
      .single();

    if (projectError || !project) {
      throw error(404, { message: "Projekt nie został znaleziony" });
    }

    // Sprawdź, czy użytkownik ma dostęp do projektu
    const { data: projectAccess, error: accessError } = await supabase
      .from("projects_users")
      .select("*")
      .eq("project_id", parseInt(projectId))
      .eq("user_id", user.id)
      .single();

    if (accessError || !projectAccess) {
      throw error(403, { message: "Nie masz dostępu do tego projektu" });
    }

    // 1. Pobierz listę wszystkich plików w storage dla projektu
    const { data: filesList, error: listError } = await supabase.storage
      .from("project_files")
      .list(project.slug);

    if (listError) {
      console.error("Błąd podczas pobierania listy plików:", listError);
      throw error(500, { message: listError.message });
    }

    // 2. Utwórz tablicę ścieżek do plików
    const filePaths = filesList.map((file) => `${project.slug}/${file.name}`);

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

    // 4. Usuń rekord projektu z bazy danych
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", parseInt(projectId));

    if (deleteError) {
      console.error("Błąd podczas usuwania projektu:", deleteError);
      throw error(500, { message: deleteError.message });
    }

    // 5. Zwróć informację o powodzeniu operacji
    return json({
      success: true,
      message: "Projekt został pomyślnie usunięty",
    });
  } catch (err) {
    console.error(`Error in DELETE /api/projects/${projectId}:`, err);
    throw error(500, { message: "Wystąpił błąd podczas usuwania projektu" });
  }
};
