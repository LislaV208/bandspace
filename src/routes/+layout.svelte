<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { User, ArrowLeft, Share2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';

  let isAuthenticated = false;
  let isShareModalOpen = false;
  let shareEmail = '';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    isAuthenticated = !!session;

    supabase.auth.onAuthStateChange((event, session) => {
      isAuthenticated = !!session;
    });
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/login');
  }

  function handleShare() {
    if (shareEmail.trim()) {
      console.log('Sharing project with:', shareEmail);
      isShareModalOpen = false;
      shareEmail = '';
    }
  }

  $: currentProjectId = $page.params.id;
  $: isProjectPage = $page.url.pathname.startsWith('/projects');
  $: isProjectDetailPage = currentProjectId !== undefined;
</script>

<div class="min-h-screen bg-gray-900 text-white">
  {#if isAuthenticated}
    <header class="bg-gray-800 shadow-lg">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            {#if isProjectDetailPage}
              <button
                on:click={() => goto('/projects')}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Back to projects"
              >
                <ArrowLeft size={24} />
              </button>
            {/if}
            <div class="text-xl font-bold">
              {#if isProjectDetailPage}
                Rehearsal #3
              {:else}
                BandSpace
              {/if}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            {#if isProjectDetailPage}
              <button
                on:click={() => isShareModalOpen = true}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Share project"
              >
                <Share2 size={24} />
              </button>
            {/if}
            <button
              on:click={handleLogout}
              class="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Logout"
            >
              <User size={24} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>

  {#if isShareModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      transition:fade
    >
      <div
        class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
        transition:slide
      >
        <h2 class="text-xl font-bold mb-4">Share Project</h2>
        <form on:submit|preventDefault={handleShare}>
          <input
            type="email"
            bind:value={shareEmail}
            placeholder="Enter email address"
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              class="px-4 py-2 text-gray-300 hover:text-white"
              on:click={() => isShareModalOpen = false}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-medium"
            >
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>