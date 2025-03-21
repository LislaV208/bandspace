import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals: { supabase },
  params,
}) => {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("slug", params.projectSlug)
    .single();

  if (projectError) {
    throw error(500, projectError.message);
  }

  const { data: track, error: trackError } = await supabase
    .from("tracks")
    .select(
      "*, uploaded_by(*), comments:track_comments(*, user:user_id(*)), files:track_files(*, uploaded_by(*), category:category_id(*))"
    )
    .eq("project_id", project.id)
    .eq("slug", params.trackSlug)
    .single();

  if (trackError) {
    throw error(500, trackError.message);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("track_categories")
    .select("*");

  if (categoriesError) {
    throw error(500, categoriesError.message);
  }

  return { track, categories };
};
