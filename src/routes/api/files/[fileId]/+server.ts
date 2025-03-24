import { error, json, type RequestHandler } from "@sveltejs/kit";

export const PATCH: RequestHandler = async ({
  request,
  locals: { supabase },
  params,
}) => {
  const fileId = parseInt(params.fileId ?? "");

  const data = await request.json();

  console.log("data", data);

  const { data: file, error: fileError } = await supabase
    .from("track_files")
    .update(data)
    .eq("id", fileId)
    .select("*, uploaded_by(*), category:category_id(*)")
    .single();

  if (!file || fileError) {
    throw error(400, {
      message: fileError?.message || "Nie udało się zaktualizować pliku.",
    });
  }

  return json(file);
};

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
