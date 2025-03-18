<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import TrackComments from "$lib/components/tracks/comment/TrackComments.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    Download,
    FastForward,
    Pause,
    Play,
    Rewind,
    Send,
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

<!-- <Breadcrumbs project={data.project} recording={data.recording} /> -->

<div class="flex-1 flex flex-col lg:flex-row gap-6 p-4">
  <div class="w-full lg:w-2/3">
    <div
      class="bg-gray-800/90 rounded-lg p-4 sm:p-6 border border-gray-700/30 shadow-lg"
    >
      <div class="mb-8">
        <div class="flex flex-col items-start gap-2 mb-4">
          <h1 class="text-3xl font-bold text-white mb-1">
            {track.name}
          </h1>
          <p class="text-lg text-gray-400">{data.project.name}</p>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="text-sm text-gray-500 flex flex-wrap items-center gap-2">
            <span class="whitespace-nowrap">
              Dodano przez: {track.uploaded_by.name ||
                track.uploaded_by.email ||
                "-"}
            </span>
            <span class="hidden sm:inline">•</span>
            <span class="whitespace-nowrap"
              >{new Date(track.created_at).toLocaleString()}</span
            >
          </div>

          <button
            class="p-2 text-gray-400 hover:text-white bg-gray-700/40 hover:bg-gray-700/70 rounded-md transition-all flex items-center gap-2"
            title="Download track"
            onclick={async () => {
              const { data, error } = await supabase.storage
                .from("project_files")
                .download(track.storage_file_path);
              if (error) {
                console.error("Error downloading file:", error);
                return;
              }
              const url = URL.createObjectURL(data);
              const link = document.createElement("a");
              link.href = url;
              link.download = track.name;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={20} />
            <span class="text-sm">Pobierz</span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
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

        <div
          class="relative h-2 bg-gray-700/40 rounded-full cursor-pointer overflow-hidden mt-6"
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
            class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
            style="width: {progress}%"
          ></div>
        </div>

        <div class="flex justify-between text-sm text-gray-400">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>

        <div class="flex items-center justify-center gap-3 sm:gap-5 mt-4">
          <button
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/40 rounded-full transition-all"
            onclick={skipBackward}
            title="Cofnij 10 sekund"
          >
            <Rewind size={18} />
          </button>

          <button
            class="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-md"
            onclick={togglePlayback}
            title={isPlaying ? "Pauza" : "Odtwórz"}
          >
            {#if isPlaying}
              <Pause size={20} />
            {:else}
              <Play size={20} />
            {/if}
          </button>

          <button
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/40 rounded-full transition-all"
            onclick={skipForward}
            title="Przewiń 10 sekund"
          >
            <FastForward size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full lg:w-1/3">
    <TrackComments />
  </div>
</div>

{#if loadError}
  <div
    class="mt-4 mx-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm"
  >
    {loadError}
  </div>
{/if}
