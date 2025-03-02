<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import ProfileMenu from "$lib/components/ProfileMenu.svelte";
  import ShareModal from "$lib/components/ShareModal.svelte";
  import { ArrowLeft, Share2 } from "lucide-svelte";
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

  let isShareModalOpen = $state(false);
  let isProfileMenuOpen = $state(false);

  function handleShare(email: string) {
    console.log("Sharing project with:", email);
    isShareModalOpen = false;
  }

  let currentProjectId = $derived($page.params.id);
  let isProjectDetailPage = $derived(currentProjectId !== undefined);
</script>

<div class="min-h-screen bg-gray-900 text-white">
  {#if user != null}
    <header class="bg-gray-800 shadow-lg">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            {#if isProjectDetailPage}
              <button
                onclick={() => goto("/projects")}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Back to projects"
              >
                <ArrowLeft size={24} />
              </button>
            {/if}
            <div class="text-xl font-bold">BandSpace</div>
          </div>
          <div class="flex items-center space-x-2">
            {#if isProjectDetailPage}
              <button
                onclick={() => (isShareModalOpen = true)}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Share project"
              >
                <Share2 size={24} />
              </button>
            {/if}
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

  <ShareModal
    isOpen={isShareModalOpen}
    onClose={() => (isShareModalOpen = false)}
    onShare={handleShare}
  />
</div>
