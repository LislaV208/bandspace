<script lang="ts">
  import "../app.css";

  import { version } from "$app/environment";
  import { invalidate } from "$app/navigation";
  import UserProfileMenu from "$lib/components/user-profile/UserProfileMenu.svelte";
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
        user:
          newSession?.user === null
            ? null
            : {
                id: newSession?.user?.id || "",
                created_at: newSession?.user?.created_at || "",
                email: newSession?.user?.email || "",
                name: newSession?.user?.user_metadata?.full_name || "",
                avatar_url: newSession?.user?.user_metadata?.avatar_url || "",
              },
      });
      invalidate("supabase:auth");
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<div
  class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative"
>
  {#if user != null}
    <header
      class="bg-gray-800/70 shadow-lg top-0 z-50 border-b border-gray-600/50"
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
            <UserProfileMenu {user} />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-6 py-8 pb-16">
    {@render children?.()}
  </main>

  <footer
    class="text-center py-3 text-gray-500 text-xs absolute bottom-0 w-full"
  >
    <p>BandSpace v{version}</p>
  </footer>
</div>
