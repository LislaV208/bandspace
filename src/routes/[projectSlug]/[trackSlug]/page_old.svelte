<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import TrackComments from "$lib/components/tracks/comment/TrackComments.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { setSupabaseContext } from "$lib/supabase-context";
  import {
    Download,
    FastForward,
    MessageSquare,
    Music,
    Pause,
    Play,
    Rewind,
    Send,
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const { supabase, track } = data;

  setSupabaseContext(supabase);

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

  // Stan dla systemu zakładek
  let activeTab = $state("player"); // Domyślnie aktywna zakładka "Odtwarzacz"

  // Funkcja do przełączania zakładek
  function setActiveTab(tab: string): void {
    activeTab = tab;
  }

  // Przykładowe pliki (dane zahardkodowane)
  const relatedFiles = [
    {
      id: 1,
      name: "Gitara - nagranie główne.mp3",
      category: "Instrumenty",
      date: "18.03.2025",
      author: "Mroczny Tapczан",
      isMain: true,
    },
    {
      id: 2,
      name: "Demo - szkic.mp3",
      category: "Demo",
      date: "17.03.2025",
      author: "Mroczny Tapczан",
      isMain: false,
    },
    {
      id: 3,
      name: "Wersja finalna - mix.wav",
      category: "Finał",
      date: "18.03.2025",
      author: "Mroczny Tapczан",
      isMain: false,
    },
  ];
</script>

<Breadcrumbs project={data.project} track={data.track} />
<div class="flex-1 pt-8 pb-8">
  <!-- System zakładek -->
  <div class="mb-6">
    <div class="flex border-b border-gray-700/50">
      <button
        class="px-4 py-2 font-medium text-sm transition-all {activeTab ===
        'player'
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-300'}"
        onclick={() => setActiveTab("player")}
      >
        <div class="flex items-center gap-2">
          <Play size={16} />
          <span>Odtwarzacz</span>
        </div>
      </button>

      <button
        class="px-4 py-2 font-medium text-sm transition-all {activeTab ===
        'files'
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-300'}"
        onclick={() => setActiveTab("files")}
      >
        <div class="flex items-center gap-2">
          <Music size={16} />
          <span>Pliki</span>
        </div>
      </button>

      <button
        class="px-4 py-2 font-medium text-sm transition-all {activeTab ===
        'comments'
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-300'}"
        onclick={() => setActiveTab("comments")}
      >
        <div class="flex items-center gap-2">
          <MessageSquare size={16} />
          <span>Komentarze</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Panel z zawartością zakładek -->
  <div class="bg-gray-800/90 rounded-lg border border-gray-700/30 shadow-lg">
    <!-- Zakładka Odtwarzacz -->
    {#if activeTab === "player"}
      <div class="p-4 sm:p-6 space-y-4">
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

      <!-- Początek sekcji z plikami powiązanymi -->

      <!-- Koniec sekcji z plikami powiązanymi -->
    {/if}

    <!-- Zakładka Pliki -->
    {#if activeTab === "files"}
      <div class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white">Wszystkie pliki</h2>

          <div class="flex items-center gap-2">
            <select
              class="py-1.5 px-2 text-sm bg-gray-700/70 text-gray-300 rounded-md border border-gray-600/40 focus:border-blue-500/50 outline-none"
            >
              <option value="all">Wszystkie kategorie</option>
              <option value="instrumenty">Instrumenty</option>
              <option value="demo">Demo</option>
              <option value="final">Finał</option>
            </select>

            <button
              class="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 rounded-md border border-blue-700/40 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><line x1="12" y1="5" x2="12" y2="19"></line><line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                ></line></svg
              >
              Dodaj plik
            </button>
          </div>
        </div>

        <div class="space-y-3">
          {#each relatedFiles as file}
            <div
              class="flex items-center p-3 bg-gray-800/70 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all group"
            >
              <!-- Kategoria pliku -->
              <div class="hidden sm:flex flex-shrink-0 w-24 mr-3">
                <span
                  class="px-2 py-1 text-xs rounded-full font-medium {file.category ===
                  'Demo'
                    ? 'bg-amber-800/30 text-amber-300'
                    : file.category === 'Instrumenty'
                      ? 'bg-blue-800/30 text-blue-300'
                      : 'bg-green-800/30 text-green-300'}"
                >
                  {file.category}
                </span>
              </div>

              <!-- Informacje o pliku -->
              <div class="flex-grow min-w-0">
                <div class="flex items-center">
                  <span class="font-medium text-white truncate"
                    >{file.name}</span
                  >
                  {#if file.isMain}
                    <span
                      class="ml-2 px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded"
                      >Główny</span
                    >
                  {/if}
                </div>
                <div
                  class="text-xs text-gray-400 mt-1 flex items-center flex-wrap gap-1"
                >
                  <span
                    class="sm:hidden mr-1 px-1.5 py-0.5 text-[10px] rounded-full {file.category ===
                    'Demo'
                      ? 'bg-amber-800/30 text-amber-300'
                      : file.category === 'Instrumenty'
                        ? 'bg-blue-800/30 text-blue-300'
                        : 'bg-green-800/30 text-green-300'}"
                    >{file.category}</span
                  >
                  <span>{file.author}</span>
                  <span class="mx-1">•</span>
                  <span>{file.date}</span>
                </div>
              </div>

              <!-- Przyciski akcji -->
              <div class="ml-2 flex items-center gap-1">
                <button
                  class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/60 rounded-full transition-all"
                  title="Odtwórz"
                >
                  <Play size={16} />
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/60 rounded-full transition-all"
                  title="Pobierz"
                >
                  <Download size={16} />
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-blue-400 rounded-full transition-all {file.isMain
                    ? 'text-blue-400'
                    : ''}"
                  title={file.isMain ? "Plik główny" : "Ustaw jako główny"}
                >
                  {#if file.isMain}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      ></polygon></svg
                    >
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      ></polygon></svg
                    >
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Zakładka Komentarze (zakomentowana zgodnie z prośbą) -->
    {#if activeTab === "comments"}
      <div class="p-4 sm:p-6">
        <div class="flex justify-center items-center py-12 text-gray-400">
          <p>Komentarze będą dostępne wkrótce</p>
        </div>
      </div>
    {/if}

    <!-- <div class="lg:w-5/12">
      <TrackComments trackId={track.id} comments={track.comments} />
    </div> -->
  </div>
</div>

{#if loadError}
  <div
    class="mt-4 mx-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm"
  >
    {loadError}
  </div>
{/if}
