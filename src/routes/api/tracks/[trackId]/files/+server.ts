import type { TrackFile } from "$lib/types/track_file";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase }, params }) => {
  const trackId = parseInt(params.trackId ?? "");

  const { data, error: trackFileError } = await supabase
    .from("track_files")
    .select("*, uploaded_by(*), category:category_id(*)")
    .eq("track_id", trackId);

  const trackFiles = data as TrackFile[];

  if (!trackFiles || trackFileError) {
    throw error(404, {
      message: trackFileError?.message || "Pliki utworu nie zostały znalezione",
    });
  }

  return json(trackFiles);
};

export const POST: RequestHandler = async ({
  request,
  locals: { supabase },
  params,
}) => {
  const trackId = parseInt(params.trackId ?? "");

  const {
    storage_path,
    category_id,
    is_default,
    description,
    file_extension,
    file_name,
    file_size,
  } = await request.json();

  const { data: trackFile, error: trackFileError } = await supabase
    .from("track_files")
    .insert({
      track_id: trackId,
      storage_path,
      category_id,
      description,
      file_extension,
      file_name,
      file_size,
    })
    .select("*, uploaded_by(*), category:category_id(*)")
    .single();

  if (trackFileError) {
    throw error(500, {
      message: trackFileError.message || "Nie udało się dodać pliku do utworu.",
    });
  }

  if (is_default) {
    const { error: trackError } = await supabase
      .from("tracks")
      .update({ default_file_id: trackFile.id })
      .eq("id", trackId);

    if (trackError) {
      console.error("Error setting default file:", trackError);

      // usun plik
      const { error: deleteError } = await supabase
        .from("track_files")
        .delete()
        .eq("id", trackFile.id);

      if (deleteError) {
        console.error("Error deleting file:", deleteError);
      }

      throw error(500, {
        message:
          trackError.message || "Nie udało się ustawić pliku domyślnego.",
      });
    }
  }

  console.log("File uploaded:", trackFile);

  return json(trackFile);
};
