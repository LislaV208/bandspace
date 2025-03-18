import type { Database } from "$lib/database.types";
import type { User } from "./user";

type dbTrackComment = Database["public"]["Tables"]["track_comments"]["Row"];

export type TrackComment = Omit<dbTrackComment, "track_id" | "user_id"> & {
  user: User;
};
