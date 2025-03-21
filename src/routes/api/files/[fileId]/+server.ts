import { error, json, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({
  locals: { supabase },
  params,
}) => {
  const fileId = parseInt(params.fileId ?? "");

  const { error: deleteError } = await supabase
    .from("track_files")
    .delete()
    .eq("id", fileId);

  if (deleteError) {
    throw error(500, {
      message: deleteError.message || "Nie udało się usunąć pliku.",
    });
  }

  return json({ success: true });
};
