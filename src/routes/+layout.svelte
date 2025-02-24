<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { ArrowLeft, Share2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import ProfileMenu from '$lib/components/ProfileMenu.svelte';
  import ShareModal from '$lib/components/ShareModal.svelte';

  let isShareModalOpen = false;
  let isProfileMenuOpen = false;

  onMount(() => {
    auth.initialize();
  });


  function handleShare(email: string) {
    console.log('Sharing project with:', email);
    isShareModalOpen = false;
  }

  $: currentProjectId = $page.params.id;
  $: isProjectDetailPage = currentProjectId !== undefined;
</script>

<div class="min-h-screen bg-gray-900 text-white">
  {#if $auth.isAuthenticated}
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
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onToggle={() => isProfileMenuOpen = !isProfileMenuOpen}
            />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>

  <ShareModal
    isOpen={isShareModalOpen}
    onClose={() => isShareModalOpen = false}
    onShare={handleShare}
  />
</div>