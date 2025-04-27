<script lang="ts">
  import { goto } from "$app/navigation";
  import type { Track } from "$lib/types/track";
  import type { TrackCategory } from "$lib/types/track_category";
  import { formatDistanceToNow } from "date-fns";
  import { pl } from "date-fns/locale";
  import { Headphones, MoreVertical, Plus, Trash2, X } from "lucide-svelte";
  import ProjectActionButton from "../projects/ProjectActionButton.svelte";
  import Button from "../ui/Button.svelte";

  let {
    tracks,
    categories,
    projectSlug,
    onNewTrack,
    onDeleteTrack,
  }: {
    tracks: Track[];
    categories: TrackCategory[];
    projectSlug: string;
    onNewTrack: () => void;
    onDeleteTrack: (track: Track) => void;
  } = $props();

  // Stan filtrowania i sortowania
  let searchQuery = $state("");
  let sortField = $state("created_at");
  let sortDirection = $state<"asc" | "desc">("desc");

  // Funkcja do formatowania daty
  function formatDate(dateStr: string) {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: pl,
    });
  }

  // Funkcja do sortowania utworów
  function toggleSort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "desc";
    }
  }

  // Filtrowanie i sortowanie utworów - poprawne użycie $derived
  let filteredTracks = $derived(
    tracks
      .filter((track) => {
        if (!searchQuery) return true;
        return track.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        const fieldA = a[sortField as keyof Track];
        const fieldB = b[sortField as keyof Track];

        // Obsługa wartości null i undefined
        if (fieldA === fieldB) return 0;
        if (fieldA === null || fieldA === undefined) return 1;
        if (fieldB === null || fieldB === undefined) return -1;

        // Bezpieczne porównanie wartości
        const comparison = String(fieldA) < String(fieldB) ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      })
  );

  // Funkcja do pobierania nazwy kategorii
  function getCategoryName() {
    // W tej wersji nie mamy jeszcze kategorii, więc zwracamy domyślną wartość
    return "Inne";
  }
</script>

<div>
  <div class="flex items-center justify-between mb-4">
    <!-- Panel wyszukiwania -->
    <div class="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Szukaj utworów..."
        class="w-full px-3 py-2 bg-gray-800/70 border border-gray-700/50 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        bind:value={searchQuery}
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg
          class="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
    </div>

    <Button
      icon={Plus}
      onclick={onNewTrack}
      class="bg-blue-600 hover:bg-blue-500 text-white ml-4"
      primary
    >
      Nowy utwór
    </Button>
  </div>

  {#if tracks.length === 0}
    <div
      class="bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center"
    >
      <div
        class="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-3"
      >
        <Headphones size={24} class="text-gray-400" />
      </div>
      <h3 class="text-white font-medium mb-2">Brak utworów</h3>
      <p class="text-gray-400 text-sm mb-4">
        Dodaj pierwszy utwór do tego projektu
      </p>
      <ProjectActionButton
        icon={Plus}
        onclick={onNewTrack}
        class="bg-blue-600 hover:bg-blue-500 text-white"
      >
        Dodaj utwór
      </ProjectActionButton>
    </div>
  {:else if filteredTracks.length === 0}
    <div class="bg-gray-800 rounded-lg p-6 text-center">
      <h3 class="text-white font-medium mb-2">Nie znaleziono utworów</h3>
      <p class="text-gray-400 text-sm mb-4">
        Nie znaleziono utworów pasujących do wyszukiwania
      </p>
      <ProjectActionButton icon={X} onclick={() => (searchQuery = "")}>
        Wyczyść wyszukiwanie
      </ProjectActionButton>
    </div>
  {:else}
    <div class="bg-gray-800 rounded-lg overflow-hidden">
      <div class="w-full overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-700/30">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                <button
                  class="flex items-center"
                  onclick={() => toggleSort("name")}
                >
                  Nazwa utworu
                  <span class="ml-2 text-blue-400">
                    {#if sortField === "name"}
                      {sortDirection === "asc" ? "↑" : "↓"}
                    {:else}
                      ↕
                    {/if}
                  </span>
                </button>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell"
              >
                Kategoria
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
              >
                <button
                  class="flex items-center"
                  onclick={() => toggleSort("created_at")}
                >
                  Data dodania
                  <span class="ml-2 text-blue-400">
                    {#if sortField === "created_at"}
                      {sortDirection === "asc" ? "↑" : "↓"}
                    {:else}
                      ↕
                    {/if}
                  </span>
                </button>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
              >
                <button
                  class="flex items-center"
                  onclick={() => toggleSort("files_count")}
                >
                  Pliki
                  <span class="ml-2 text-blue-400">
                    {#if sortField === "files_count"}
                      {sortDirection === "asc" ? "↑" : "↓"}
                    {:else}
                      ↕
                    {/if}
                  </span>
                </button>
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            {#each filteredTracks as track (track.id)}
              <tr
                class="hover:bg-gray-700/30 cursor-pointer transition-colors"
                onclick={() => goto(`/${projectSlug}/${track.slug}`)}
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Headphones size={16} class="mr-2 text-gray-400" />
                    <div class="text-sm font-medium text-white">
                      {track.name}
                    </div>
                  </div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell"
                >
                  {getCategoryName()}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell"
                >
                  {formatDate(track.created_at)}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell"
                >
                  {track.files_count || 0}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-600/50"
                    onclick={(e) => {
                      e.stopPropagation();
                      onDeleteTrack(track);
                    }}
                    title="Usuń utwór"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
