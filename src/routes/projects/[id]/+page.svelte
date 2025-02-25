<script lang="ts">
  import { Play, Pause, Plus, Mic, Upload, Loader2, Trash2 } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { tracksService } from '$lib/services/tracks';
  import type { Track } from '$lib/services/tracks';
  import { onMount } from 'svelte';

  let recordings: Track[] = [];
  let isAddModalOpen = false;
  let audioProgress = 0;
  let isLoading = true;
  let isCreating = false;
  let isDeleting = false;
  let trackToDelete: Track | null = null;

  onMount(async () => {
    await loadTracks();
  });

  async function loadTracks() {
    try {
      isLoading = true;
      recordings = await tracksService.getTracks(parseInt($page.params.id));
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      isLoading = false;
    }
  }

  async function createTrack() {
    if (isCreating) return;
    
    try {
      isCreating = true;
      const defaultName = `Track ${recordings.length + 1}`;
      const newTrack = await tracksService.createTrack(defaultName, parseInt($page.params.id));
      recordings = [...recordings, { ...newTrack }];
    } catch (error) {
      console.error('Error creating track:', error);
    } finally {
      isCreating = false;
    }
  }

  async function deleteTrack() {
    if (!trackToDelete || isDeleting) return;

    try {
      isDeleting = true;
      await tracksService.deleteTrack(trackToDelete.id);
      recordings = recordings.filter(r => r.id !== trackToDelete?.id);
      trackToDelete = null;
    } catch (error) {
      console.error('Error deleting track:', error);
    } finally {
      isDeleting = false;
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

  <!-- Recording List -->
  <div class="max-w-3xl mx-auto px-4 py-6">
    {#if isLoading}
      <div class="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 class="animate-spin" size={32} />
      </div>
    {:else}
      <div class="space-y-4">
        {#each recordings as recording (recording.id)}
          <div
            class="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
            transition:slide
          >
            <h2 class="font-semibold text-lg">{recording.name}</h2>
            <button
              class="p-2 text-gray-400 hover:text-red-500 transition-colors"
              on:click={() => trackToDelete = recording}
              title="Delete track"
            >
              <Trash2 size={20} />
            </button>
          </div>
        {/each}

        {#if recordings.length === 0}
          <div class="flex items-center justify-center h-[calc(100vh-12rem)]">
            <div class="text-gray-400">
              No recordings yet - add your first!
            </div>
          </div>
        {/if}
      </div>
    {/if}

  <!-- Add Recording Button -->
  <button
    class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={createTrack}
    disabled={isCreating}
    title="Add recording"
  >
    {#if isCreating}
      <Loader2 size={24} class="animate-spin" />
    {:else}
      <Plus size={24} />
    {/if}
  </button>

  <!-- Delete Confirmation Modal -->
  {#if trackToDelete}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      transition:fade
    >
      <div
        class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
        transition:slide
      >
        <h2 class="text-xl font-bold mb-4">Delete Track</h2>
        <p class="text-gray-300 mb-6">Are you sure you want to delete "{trackToDelete.name}"? This action cannot be undone.</p>
        <div class="flex space-x-4">
          <button
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={deleteTrack}
            disabled={isDeleting}
          >
            {#if isDeleting}
              <Loader2 class="animate-spin mx-auto" size={20} />
            {:else}
              Delete
            {/if}
          </button>
          <button
            class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            on:click={() => trackToDelete = null}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>