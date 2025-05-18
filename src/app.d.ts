import type { Database } from "$lib/database.types";
import type { ProjectService } from "$lib/services/ProjectService";
import type { User } from "$lib/user.type";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient<Database>;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
      }>;
      session: Session | null;
      user: User | null;
      services: {
        projectService: ProjectService;
      };
    }
    interface PageData {
      session: Session | null;
      user: User | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
