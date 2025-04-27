import type { Database } from "$lib/database.types";

// Bazowy typ Track z bazy danych
export type BaseTrack = Database["public"]["Tables"]["tracks"]["Row"];

// Rozszerzony typ Track z dodatkowymi polami
export interface Track extends BaseTrack {
  files_count?: number;
  category_id?: number | null;
}

export type TrackCreate = Omit<BaseTrack, "id" | "slug" | "created_at">;
