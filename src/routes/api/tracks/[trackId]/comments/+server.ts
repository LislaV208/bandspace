import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  params,
  locals: { supabase, user },
}) => {
  // Sprawdź, czy użytkownik jest zalogowany
  if (!user) {
    throw error(401, "Musisz być zalogowany, aby dodać komentarz");
  }

  // Pobierz ID utworu z parametrów URL
  const trackId = parseInt(params.trackId || "");
  if (isNaN(trackId)) {
    throw error(400, "Nieprawidłowe ID utworu");
  }

  try {
    // Pobierz dane z żądania
    const { content } = await request.json();

    // Walidacja danych
    if (!content || typeof content !== "string" || content.trim() === "") {
      throw error(400, "Treść komentarza jest wymagana");
    }

    // Sprawdź, czy utwór istnieje
    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .select("id")
      .eq("id", trackId)
      .single();

    if (trackError || !track) {
      throw error(404, "Utwór nie został znaleziony");
    }

    // Dodaj komentarz do bazy danych
    const { data: comment, error: commentError } = await supabase
      .from("track_comments")
      .insert({
        track_id: trackId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("*, user:user_id(*)")
      .single();

    if (commentError) {
      throw error(
        500,
        "Nie udało się dodać komentarza: " + commentError.message
      );
    }

    // Zwróć utworzony komentarz
    return json(comment, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && "body" in err) {
      throw err;
    }
    throw error(500, "Wystąpił błąd podczas dodawania komentarza");
  }
};
