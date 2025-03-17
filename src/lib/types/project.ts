import type { Database } from "$lib/database.types";
import type { Track } from "./track";

// Baza projektu z bazy danych
type DbProject = Database["public"]["Tables"]["projects"]["Row"];

// Rozszerzony typ projektu z ostatnimi utworami
export interface DashboardProject extends DbProject {
  members_count: number;
  recent_tracks: Track[];
}
