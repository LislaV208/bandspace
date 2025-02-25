// See https://kit.svelte.dev/docs/types#app
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
    }
    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};