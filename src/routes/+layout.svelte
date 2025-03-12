<script lang="ts">
  import ProfileMenu from "$lib/components/ProfileMenu.svelte";
  import "../app.css";

  import { invalidate } from "$app/navigation";
  import { setAuthState } from "$lib/state/auth-state.svelte";
  import { onMount } from "svelte";

  let { data, children } = $props();
  let { supabase, user } = $derived(data);

  $effect(() => {
    authState.updateState({
      supabase: data.supabase,
      session: data.session,
      user: data.user,
    });
  });

  const authState = setAuthState({
    supabase: data.supabase,
    session: data.session,
    user: data.user,
  });

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      authState.updateState({
        session: newSession,
        supabase,
        user: newSession?.user ?? null,
      });
      invalidate("supabase:auth");
    });

    return () => data.subscription.unsubscribe();
  });

  let isProfileMenuOpen = $state(false);
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
  {#if user != null}
    <header
      class="bg-gray-800/70 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-600/50"
    >
      <nav class="container mx-auto px-6 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <button
              class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-300"
            >
              <a href="/"> BandSpace </a>
            </button>
          </div>
          <div class="flex items-center space-x-4">
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onToggle={() => (isProfileMenuOpen = !isProfileMenuOpen)}
            />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-6 py-8">
    {@render children?.()}
  </main>
</div>
