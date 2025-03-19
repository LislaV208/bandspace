import type { Database } from "$lib/database.types";
import type { Track } from "$lib/types/track";
import type { TrackCategory } from "$lib/types/track_category";
import type { User } from "$lib/types/user";

type dbTrackFile = Database["public"]["Tables"]["track_files"]["Row"];

export type TrackFile = Omit<dbTrackFile, "category_id" | "uploaded_by"> & {
  category: TrackCategory;
  uploaded_by: User;
};

export type TrackFileCreate = Omit<
  dbTrackFile,
  "id" | "track_id" | "uploaded_by" | "created_at" | "updated_at"
>;
