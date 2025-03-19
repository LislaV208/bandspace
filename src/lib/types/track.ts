import type { Database } from "$lib/database.types";

export type Track = Database["public"]["Tables"]["tracks"]["Row"];
export type TrackCreate = Omit<Track, "id" | "slug" | "created_at">;
