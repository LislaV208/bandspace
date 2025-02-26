// See https://kit.svelte.dev/docs/types#app
import type { User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
    }
    // interface Error {}
    // interface PageData {}
    // interface Platform {}
  }
}

export { };
