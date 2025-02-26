import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null
  });

  return {
    subscribe,
    set,
    setAuthenticated: (user: User | null) => {
      set({
        isAuthenticated: !!user,
        user
      });
    },
    reset: () => {
      set({
        isAuthenticated: false,
        user: null
      });
    }
  };
}

export const auth = createAuthStore();