import type { Database } from "$lib/database.types";
import type { User } from "./user";

type dbTrackComment = Database["public"]["Tables"]["track_comments"]["Row"];

export type TrackComment = Omit<dbTrackComment, "user_id"> & {
  user: User;
};
