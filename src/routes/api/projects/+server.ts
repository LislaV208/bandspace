import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Endpoint GET do pobierania listy projektów użytkownika.
 * Zwraca listę projektów wraz z podstawowymi informacjami.
 */
export const GET: RequestHandler = async ({ locals: { user, services } }) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: "Nieautoryzowany dostęp" });
  }

  try {
    // Pobieranie projektów użytkownika za pomocą serwisu z locals
    const projects = await services.projectService.getUserProjects(user.id);

    return json(projects);
  } catch (err) {
    console.error("Error in GET /api/projects:", err);
    throw error(500, { message: "Wystąpił błąd podczas pobierania projektów" });
  }
};

/**
 * Endpoint POST do tworzenia nowego projektu.
 * Przyjmuje nazwę projektu i tworzy nowy projekt.
 */
export const POST: RequestHandler = async ({
  request,
  locals: { user, services },
}) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, { message: "Nieautoryzowany dostęp" });
  }

  try {
    // Pobierz dane z żądania
    const { name } = await request.json();

    try {
      // Tworzenie nowego projektu za pomocą serwisu z locals
      const project = await services.projectService.createProject(name);

      return json({
        success: true,
        project,
      });
    } catch (serviceError) {
      if (
        serviceError instanceof Error &&
        serviceError.message === "Nazwa projektu nie może być pusta"
      ) {
        throw error(400, { message: serviceError.message });
      }
      throw serviceError;
    }
  } catch (err) {
    console.error("Error in POST /api/projects:", err);
    if (
      err instanceof Error &&
      err.message === "Nazwa projektu nie może być pusta"
    ) {
      throw error(400, { message: err.message });
    }
    throw error(500, { message: "Wystąpił błąd podczas tworzenia projektu" });
  }
};
