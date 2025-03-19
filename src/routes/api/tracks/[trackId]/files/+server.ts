import type { TrackFile } from "$lib/types/track_file";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  request,
  locals: { supabase, user },
  params,
}) => {
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
