<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import {
    Download,
    Pause,
    Play,
    Share2,
    SkipBack,
    SkipForward,
  } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  let isPlaying = $state(false);
  let progress = $state(0);
  let currentTime = $state("0:00");

  const recording = data.track;

  function togglePlayback() {}

  function seek(event: MouseEvent) {}

  function skipBackward() {}

  function skipForward() {}
</script>

<Breadcrumbs project={data.project} recording={data.recording} />
<div class="max-w-4xl mx-auto px-4 py-8">
  <div
    class="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-8 border border-gray-600/50 shadow-xl"
  >
    <!-- Track Info -->
    <div
      class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8"
    >
      <div class="w-full md:w-auto">
        <div
          class="aspect-square w-48 bg-gray-700/50 rounded-lg shadow-lg flex items-center justify-center"
        >
          <Play size={48} class="text-gray-400" />
        </div>
      </div>

      <div class="flex-grow">
        <h1
          class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-2"
        >
          {recording.name}
        </h1>
        <p class="text-xl text-gray-400 mb-4">{data.project.name}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>Uploaded by Stachu Jones</span>
          <span>•</span>
          <span>{new Date(recording.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
          title="Download track"
        >
          <Download size={24} />
        </button>
        <button
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
          title="Share track"
        >
          <Share2 size={24} />
        </button>
      </div>
    </div>

    <!-- Audio Player -->
    <div class="space-y-4">
      <!-- Timeline -->
      <div
        class="relative h-2 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden"
        onclick={seek}
      >
        <div
          class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100"
          style="width: {progress}%"
        />
      </div>

      <!-- Time and Duration -->
      <div class="flex justify-between text-sm text-gray-400">
        <span>{currentTime}</span>
        <span>3:14</span>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-6">
        <button
          class="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
          onclick={skipBackward}
          title="Skip 10 seconds backward"
        >
          <SkipBack size={24} />
        </button>

        <button
          class="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 rounded-full transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-lg"
          onclick={togglePlayback}
          title={isPlaying ? "Pause" : "Play"}
        >
          {#if isPlaying}
            <Pause size={32} />
          {:else}
            <Play size={32} />
          {/if}
        </button>

        <button
          class="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
          onclick={skipForward}
          title="Skip 10 seconds forward"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  </div>
</div>
