import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { goto } from '$app/navigation';

interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
}

interface UserData {
  email?: string;
  user_metadata?: UserMetadata;
}

interface AuthState {
  isAuthenticated: boolean;
  userData: UserData | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    userData: null
  });

  return {
    subscribe,
    initialize: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        isAuthenticated: !!session,
        userData: session?.user || null
      });

      supabase.auth.onAuthStateChange((event, session) => {
        set({
          isAuthenticated: !!session,
          userData: session?.user || null
        });
      });
    },
    signOut: async () => {
      await supabase.auth.signOut();
      set({
        isAuthenticated: false,
        userData: null
      });
      goto('/login');
    }
  };
}

export const auth = createAuthStore();