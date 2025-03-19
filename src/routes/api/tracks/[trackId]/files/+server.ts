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
    is_primary,
    description,
    file_extension,
    file_name,
    file_size,
  } = await request.json();

  console.log("uploading file", {
    storage_path,
    category_id,
    is_primary,
    description,
    file_extension,
    file_name,
    file_size,
  });

  const { data: trackFile, error: trackFileError } = await supabase
    .from("track_files")
    .insert({
      track_id: trackId,
      storage_path,
      category_id,
      is_primary,
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

  console.log("File uploaded:", trackFile);

  return json(trackFile);
};
