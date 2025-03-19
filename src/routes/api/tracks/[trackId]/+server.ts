import type { TrackFile } from "$lib/types/track_file";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  request,
  locals: { supabase, user },
  params,
}) => {
  const trackId = parseInt(params.trackId ?? "");

  const { data: track, error: trackError } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", trackId)
    .single();

  if (!track || trackError) {
    throw error(404, {
      message: trackError?.message || "Utwór nie został znaleziony",
    });
  }

  return json(track);
};
