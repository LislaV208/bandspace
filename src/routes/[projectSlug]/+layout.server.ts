import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

// interface BreadcrumbsData {
//     projectName: string;
//     trackName: string | null;
// }

export const load: LayoutServerLoad = async ({
  params,
  locals: { supabase },
}) => {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("slug", params.projectSlug)
    .single();
  if (projectError) {
    console.error(
      `Error fetching project in +layout.server.ts [${params.projectSlug}]:`,
      projectError
    );
    throw error(500, "Internal Server Error");
  }

  let trackId = null;
  let trackName = null;
  const trackSlug = params.trackSlug ?? null;
  if (trackSlug) {
    const { data, error: fileError } = await supabase
      .from("tracks")
      .select("id, name")
      .eq("slug", trackSlug)
      .single();
    if (fileError) {
      console.error(
        `Error fetching file in +layout.server.ts [${params.projectSlug}]:`,
        fileError
      );
      throw error(500, "Internal Server Error");
    }

    trackId = data.id;
    trackName = data.name;
  }

  return {
    project: {
      id: project.id,
      name: project.name,
      slug: params.projectSlug,
    },
    track: {
      id: trackId,
      name: trackName,
      slug: trackSlug,
    },
  };
};
