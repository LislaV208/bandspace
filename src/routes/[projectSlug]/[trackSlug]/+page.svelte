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
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const { supabase, track } = data;

  // Stan odtwarzania
  let isPlaying = $state(false);
  let progress = $state(0);
  let currentTime = $state("0:00");
  let duration = $state("0:00");
  let loadError = $state<string | null>(null);

  // Element audio i URL pliku
  let audioElement = $state<HTMLAudioElement | null>(null);
  let audioUrl = $state<string | null>(null);

  // Formatowanie czasu (sekundy -> MM:SS)
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  // Pobranie URL pliku audio z Supabase Storage
  async function fetchAudioUrl(): Promise<void> {
    try {
      // Pobranie tymczasowego URL z Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("project_files")
        .createSignedUrl(track.storage_file_path, 3600);

      if (storageError) {
        throw storageError;
      }

      audioUrl = storageData?.signedUrl;
    } catch (error) {
      console.error("Error loading audio file:", error);
      loadError = "Nie udało się pobrać pliku audio";
    }
  }

  // Obsługa przełączania odtwarzania/pauzy
  function togglePlayback(): void {
    if (!audioElement || !audioUrl) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
        loadError = "Nie udało się odtworzyć pliku audio";
      });
    }
  }

  // Obsługa kliknięcia na pasek postępu
  function seek(event: MouseEvent): void {
    if (!audioElement) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const clickPercent = (clickPosition / rect.width) * 100;

    audioElement.currentTime = (clickPercent / 100) * audioElement.duration;
  }

  // Przewinięcie 10 sekund do tyłu
  function skipBackward(): void {
    if (!audioElement) return;
    audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
  }

  // Przewinięcie 10 sekund do przodu
  function skipForward(): void {
    if (!audioElement) return;
    audioElement.currentTime = Math.min(
      audioElement.duration,
      audioElement.currentTime + 10
    );
  }

  // Obsługa zdarzeń audio
  function handleTimeUpdate(event: Event): void {
    if (audioElement) {
      progress = (audioElement.currentTime / audioElement.duration) * 100;
      currentTime = formatTime(audioElement.currentTime);
    }
  }

  function handleMetadataLoaded(event: Event): void {
    if (audioElement) {
      duration = formatTime(audioElement.duration);
    }
  }

  function handleAudioEnded(event: Event): void {
    isPlaying = false;
    progress = 0;
    currentTime = "0:00";
  }

  function handlePlayStateChange(event: Event): void {
    if (audioElement) {
      isPlaying = !audioElement.paused;
    }
  }

  function handleError(event: Event): void {
    loadError = "Nie udało się załadować pliku audio";
    isPlaying = false;
  }

  // Inicjalizacja po załadowaniu komponentu
  onMount(() => {
    fetchAudioUrl();
  });
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
          {track.name}
        </h1>
        <p class="text-xl text-gray-400 mb-4">{data.project.name}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>Uploaded by Stachu Jones</span>
          <span>•</span>
          <span>{new Date(track.created_at).toLocaleString()}</span>
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
      <!-- Ukryty element audio -->
      {#if audioUrl}
        <audio
          bind:this={audioElement}
          src={audioUrl}
          preload="metadata"
          ontimeupdate={handleTimeUpdate}
          onloadedmetadata={handleMetadataLoaded}
          onended={handleAudioEnded}
          onplay={handlePlayStateChange}
          onpause={handlePlayStateChange}
          onerror={handleError}
          hidden
        ></audio>
      {/if}

      <!-- Timeline -->
      <div
        class="relative h-2 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden"
        onclick={seek}
        role="slider"
        aria-label="Audio progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === "ArrowRight") skipForward();
          if (e.key === "ArrowLeft") skipBackward();
        }}
      >
        <div
          class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100"
          style="width: {progress}%"
        ></div>
      </div>

      <!-- Time and Duration -->
      <div class="flex justify-between text-sm text-gray-400">
        <span>{currentTime}</span>
        <span>{duration}</span>
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

  {#if loadError}
    <div
      class="mt-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm"
    >
      {loadError}
    </div>
  {/if}
</div>
