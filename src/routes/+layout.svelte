<script lang="ts">
  import ProfileMenu from "$lib/components/ProfileMenu.svelte";
  import "../app.css";

  import { invalidate } from "$app/navigation";
  import { setAuthState } from "$lib/state/auth-state.svelte";
  import { setTestState } from "$lib/state/test-state.svelte";
  import { onMount } from "svelte";

  let { data, children } = $props();
  let { supabase, user } = $derived(data);

  $effect(() => {
    console.log("some data just changed");
    authState.updateState({
      supabase: data.supabase,
      session: data.session,
      user: data.user,
    });
  });

  setTestState(null, null);

  // $inspect(name);

  // setContext("user", () => user);

  const authState = setAuthState({
    supabase: data.supabase,
    session: data.session,
    user: data.user,
  });

  // $inspect(user);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("event", event);
      // console.log("newSession", newSession);
      console.log("auth state changed");
      authState.updateState({
        session: newSession,
        supabase,
        user: newSession?.user ?? null,
      });
      // if (newSession?.expires_at !== session?.expires_at) {
      invalidate("supabase:auth");
      // }
    });

    console.log("auth callback initialized");

    return () => data.subscription.unsubscribe();
  });

  let isProfileMenuOpen = $state(false);
</script>

<div class="min-h-screen bg-gray-900 text-white">
  {#if user != null}
    <header class="bg-gray-800 shadow-lg">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-xl font-bold">BandSpace</div>
          </div>
          <div class="flex items-center space-x-2">
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onToggle={() => (isProfileMenuOpen = !isProfileMenuOpen)}
            />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-4 py-8">
    {@render children?.()}
  </main>
</div>
