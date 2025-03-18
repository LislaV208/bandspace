import type { Database } from "$lib/database.types";
import type { Track } from "./track";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

export interface DashboardProject extends Project {
  members_count: number;
  recent_tracks: Track[];
}
