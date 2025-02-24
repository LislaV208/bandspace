<script lang="ts">
  import { Play, Pause, Plus, Mic, Upload } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';

  interface Recording {
    id: number;
    name: string;
    duration: string;
    isPlaying: boolean;
  }

  let recordings: Recording[] = [
    { id: 1, name: 'riff_intro', duration: '0:45', isPlaying: false },
    { id: 2, name: 'drums_1', duration: '1:20', isPlaying: false },
    { id: 3, name: 'vocal_take2', duration: '2:15', isPlaying: false }
  ];

  let currentlyPlaying: Recording | null = null;
  let isAddModalOpen = false;
  let audioProgress = 0;

  function togglePlay(recording: Recording | null) {
    if (!recording) return;

    if (currentlyPlaying && currentlyPlaying.id !== recording.id) {
      currentlyPlaying.isPlaying = false;
    }
    recording.isPlaying = !recording.isPlaying;
    currentlyPlaying = recording.isPlaying ? recording : null;
    
    // Mock audio progress
    if (recording.isPlaying) {
      audioProgress = 0;
      const interval = setInterval(() => {
        audioProgress += 1;
        if (audioProgress >= 100 || !recording.isPlaying) {
          clearInterval(interval);
          if (audioProgress >= 100) {
            recording.isPlaying = false;
            currentlyPlaying = null;
            audioProgress = 0;
          }
        }
      }, 100);
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
    <div class="space-y-4">
      {#each recordings as recording (recording.id)}
        <div
          class="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
          transition:slide
        >
          <div class="flex items-center space-x-4 flex-1">
            <button
              class="p-2 rounded-full {recording.isPlaying ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} transition-colors"
              on:click={() => togglePlay(recording)}
              title={recording.isPlaying ? 'Pause' : 'Play'}
            >
              {#if recording.isPlaying}
                <Pause size={20} />
              {:else}
                <Play size={20} />
              {/if}
            </button>
            <div class="flex-1">
              <h2 class="font-semibold text-lg">{recording.name}</h2>
            </div>
            <span class="text-sm text-gray-400">{recording.duration}</span>
          </div>
        </div>
      {/each}

      {#if recordings.length === 0}
        <div class="text-center text-gray-400 py-8">
          No recordings yet - add your first!
        </div>
      {/if}
    </div>

  <!-- Add Recording Button -->
  <button
    class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
    on:click={() => isAddModalOpen = true}
    title="Add recording"
  >
    <Plus size={24} />
  </button>

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
  {#if currentlyPlaying}
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
  {/if}
</div>