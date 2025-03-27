import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase }, params }) => {
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

export const PATCH: RequestHandler = async ({
  request,
  locals: { supabase },
  params,
}) => {
  console.log("Edycja utworu: PATCH");
  const trackId = parseInt(params.trackId ?? "");
  const body = await request.json();

  const { defaultFileId, name }: {defaultFileId?: number, name?: string} = body;

  console.log("defaultFileId: ", defaultFileId);
  console.log("name: ", name);

  if (!trackId) {
    throw error(400, { message: "Nie podano ID utworu" });
  }

  const { data: track, error: trackError } = await supabase
    .from("tracks")
    // update fields only if they exists
    .update({
      ...(defaultFileId && { default_file_id: defaultFileId }),
      ...(name && { name }),
    })
    .eq("id", trackId)
    .select(
      "*, uploaded_by(*), comments:track_comments(*, user:user_id(*)), files:track_files(*, uploaded_by(*), category:category_id(*))"
    )
    .single();

  if (!track || trackError) {
    throw error(500, {
      message:
        "Błąd podczas edycji utworu: " + trackError?.message,
    });
  }

  return json(track, { status: 200 });
};
