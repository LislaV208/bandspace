import type { TrackFileCreate } from "$lib/types/track_file";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user },
}) => {
  if (!user) {
    throw error(401, { message: "Musisz być zalogowany" });
  }

  const body = await request.json();

  const {
    projectId,
    trackName,
    categoryId,
    file,
  }: {
    projectId: string;
    trackName: string;
    categoryId: number;
    file: TrackFileCreate;
  } = body;

  if (!trackName) {
    throw error(400, { message: "Nie podano nazwy utworu" });
  }

  if (!projectId) {
    throw error(400, { message: "Nie podano ID projektu" });
  }

  if (!categoryId) {
    throw error(400, { message: "Nie podano ID kategorii" });
  }

  // 1. Utwórz nowy utwór
  const trackToCreate = {
    name: trackName,
    project_id: parseInt(projectId),
    uploaded_by: user.id,
  };

  const { data: track, error: trackError } = await supabase
    .from("tracks")
    .insert([trackToCreate])
    .select()
    .single();

  if (!track || trackError) {
    throw error(500, {
      message: "Błąd podczas tworzenia utworu: " + trackError?.message,
    });
  }

  // 2. Utwórz wpis w tabeli track_files
  const { error: fileError } = await supabase.from("track_files").insert([
    {
      ...file,
      track_id: track.id,
      uploaded_by: user.id,
    },
  ]);

  if (fileError) {
    // Usuń utwór, jeśli dodanie wpisu się nie powiodło
    await supabase.from("tracks").delete().eq("id", track.id);
    throw error(500, {
      message: "Błąd podczas dodawania pliku: " + fileError.message,
    });
  }

  return json(track, { status: 201 });
};
