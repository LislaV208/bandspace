<script lang="ts">
  import { Play, Pause, Plus, Mic, Upload, Loader2 } from 'lucide-svelte';
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
  <!-- <button
    class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
    on:click={() => isAddModalOpen = true}
    title="Add recording"
  >
    <Plus size={24} />
  </button> -->

  <!-- Add Recording Modal -->
  {#if isAddModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      transition:fade
    >
      <div
        class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
        transition:slide
      >
        <h2 class="text-xl font-bold mb-6">Add Recording</h2>
        <div class="space-y-4">
          <button
            class="w-full flex items-center justify-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            on:click={
            () => {
            //   isAddModalOpen = false;
            //   goto('/projects/1/record');
            }
            }
          >
            <Mic size={24} />
            <span>Record Now</span>
          </button>
          <button
            class="w-full flex items-center justify-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Upload size={24} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            class="w-full px-4 py-2 text-gray-300 hover:text-white"
            on:click={() => isAddModalOpen = false}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Audio Player -->
  <!-- {#if currentlyPlaying}
    <div
      class="fixed bottom-0 inset-x-0 bg-gray-800 border-t border-gray-700 p-4"
      transition:slide={{ duration: 200 }}
    >
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center space-x-4">
          <button
            class="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            on:click={() => togglePlay(currentlyPlaying)}
          >
            <Pause size={20} />
          </button>
          <div class="flex-1">
            <div class="text-sm font-medium mb-1">{currentlyPlaying.name}</div>
            <div class="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 transition-all duration-100"
                style="width: {audioProgress}%"
              ></div>
            </div>
          </div>
          <div class="text-sm text-gray-400">
            {formatTime(Math.floor(audioProgress / 100 * 60))} / {currentlyPlaying.duration}
          </div>
        </div>
      </div>
    </div>
  {/if} -->
</div>