<script lang="ts">
  import "../app.css";

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
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
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

<div class="h-screen flex flex-col bg-[#101827] text-white relative">
  {#if user != null}
    <header class="bg-[#101827] shadow-lg top-0 z-50 border-b border-[#1F2937]">
      <nav class="px-6 py-3 max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <a href="/" class="flex items-center">
              <span
                class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-300"
                >BandSpace</span
              >
            </a>
          </div>
          <div class="flex items-center">
            <UserProfileMenu {user} />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="flex-1 overflow-hidden">
    {@render children?.()}
  </main>

  <!-- <footer
    class="text-center py-3 text-gray-500 text-xs absolute bottom-0 w-full"
  >
    <p>BandSpace v{version}</p>
  </footer> -->
</div>
