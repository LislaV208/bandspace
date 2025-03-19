<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import TrackComments from "$lib/components/tracks/comment/TrackComments.svelte";
  import { Download, Play } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

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

<div class="h-full bg-red-900 overflow-hidden">
  <div class="h-full grid grid-flow-col grid-rows-3 gap-4 overflow-hidden">
    <div
      class="row-span-3 bg-pink-600 text-center flex overflow-y-hidden"
    ></div>
    <div
      class="col-span-2 bg-green-600 text-center flex items-center justify-center"
    >
      02
    </div>
    <div
      class="col-span-2 row-span-2 bg-blue-600 text-center flex items-center justify-center"
    >
      03
    </div>
  </div>
</div>

<!-- <Breadcrumbs project={data.project} recording={data.recording} /> -->
<div class="h-full flex bg-gray-600">
  <!-- Panel z zawartością zakładek -->
  <!-- class="flex-1 bg-gray-800/90 rounded-lg border border-gray-700/30 shadow-lg" -->
  <div class="flex-1 bg-gray-700">
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
                <span class="font-medium text-white truncate">{file.name}</span>
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
                      : 'bg-green-800/30 text-green-300'}">{file.category}</span
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
  </div>

  <!-- <TrackComments trackId={data.track.id} comments={data.track.comments} /> -->
</div>
