import type { Database } from "$lib/database.types";

type dbTrackCategory = Database["public"]["Tables"]["track_categories"]["Row"];

export type TrackCategory = Pick<dbTrackCategory, "id" | "name">;
