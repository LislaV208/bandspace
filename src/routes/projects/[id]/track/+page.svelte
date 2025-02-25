<script lang="ts">
  import { Mic, Square } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let isRecording = false;
  let timer = 0;
  let timerInterval: number;
  let recordingName = '';

  onMount(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  function startRecording() {
    isRecording = true;
    timer = 0;
    timerInterval = window.setInterval(() => {
      timer++;
      // Auto-stop after 5 minutes
      if (timer >= 300) {
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    isRecording = false;
    clearInterval(timerInterval);
    recordingName = `recording_${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')}`;
  }

  function saveRecording() {
    console.log('Saving recording:', recordingName);
    goto('/projects/1');
  }

  function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="max-w-xl mx-auto px-4 py-12 flex flex-col items-center">
  {#if !recordingName}
    <div
      class="w-32 h-32 rounded-full border-4 {isRecording ? 'border-red-500 animate-pulse' : 'border-gray-600'} flex items-center justify-center mb-8"
    >
      <Mic size={48} class={isRecording ? 'text-red-500' : 'text-gray-400'} />
    </div>

    <div class="text-4xl font-mono mb-8">
      {formatTimer(timer)}
    </div>

    <button
      class="w-16 h-16 rounded-full {isRecording ? 'bg-red-500' : 'bg-green-500'} hover:opacity-90 transition-colors flex items-center justify-center"
      on:click={isRecording ? stopRecording : startRecording}
    >
      {#if isRecording}
        <Square size={24} />
      {:else}
        <Mic size={24} />
      {/if}
    </button>
  {:else}
    <div class="w-full max-w-md space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-300 mb-2">Recording Name</label>
        <input
          id="name"
          type="text"
          bind:value={recordingName}
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
        />
      </div>

      <div class="flex space-x-4">
        <button
          class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
          on:click={() => {
            recordingName = '';
            timer = 0;
          }}
        >
          Record Again
        </button>
        <button
          class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-medium"
          on:click={saveRecording}
        >
          Save
        </button>
      </div>
    </div>
  {/if}
</div>