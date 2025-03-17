import type { Database } from "$lib/database.types";

// Typ dla utworu muzycznego na podstawie schematu bazy danych
type DbTrack = Database["public"]["Tables"]["tracks"]["Row"];

// Typ używany dla utworów w aplikacji
export type Track = Pick<DbTrack, "id" | "name" | "created_at">;
