<script lang="ts">
  import { goto } from "$app/navigation";
  import { Loader2, Music, Plus, Users } from "lucide-svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";

  let { data, form } = $props();
  let projects = data.data;

  if (form?.error) {
    toast.error(form?.error, {
      position: "bottom-right",
    });
  }

  let isCreateModalOpen = $state(false);
  let newProjectName = $state("");
  let isCreating = $state(false);

  const hasProjects = $derived(projects.length > 0);

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pl", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<Toaster />

<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <h1 class="text-2xl">Projekty</h1>
  {#if hasProjects}
    <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
      <button
        onclick={openCreateModal}
        class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Nowy projekt
      </button>
    </div>
  {/if}
</div>

<div
  class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6 mx-auto"
>
  {#each projects as project (project.id)}
    <div class="max-w-6xl relative" transition:slide>
      <div
        role="button"
        tabindex="0"
        class="w-full text-left bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl"
        onclick={() => goto(`/${project.slug}`)}
        onkeydown={(e) => e.key === "Enter" && goto(`/${project.slug}`)}
      >
        <!-- Nagłówek karty z awatarem projektu i nazwą -->
        <div class="bg-gray-800 p-4">
          <div class="flex justify-between items-start gap-3">
            <div class="flex items-center gap-3">
              <!-- Inicjały projektu jako awatar -->
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg"
              >
                {project.name.charAt(0).toUpperCase()}
              </div>

              <div class="flex flex-col">
                <div
                  class="text-lg font-semibold group-hover:text-blue-400 transition-colors"
                >
                  {project.name}
                </div>

                <div class="flex items-center gap-1 text-gray-400 text-sm">
                  <Users size={16} />
                  <span>
                    Osoby w projekcie:
                    <b>{project.members_count}</b>
                  </span>
                </div>
              </div>
            </div>

            <!-- Wskaźnik aktywności (niebieski kropka) -->
            <!-- <div class="flex-shrink-0">
              <div class="w-2 h-2 rounded-full bg-blue-400"></div>
            </div> -->
          </div>
        </div>

        <!-- Zawartość karty -->
        <div class="p-2 border-t border-gray-700">
          <!-- Ostatnie utwory -->
          <div class="p-2 rounded text-sm">
            <div class="text-gray-300 font-medium mb-2">Ostatnie utwory:</div>
            <div class="flex flex-wrap gap-2">
              {#if project.recent_tracks && project.recent_tracks.length > 0}
                {#each project.recent_tracks as track}
                  <div
                    class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-700 border border-gray-600 text-gray-200 transition-colors hover:bg-gray-600 cursor-pointer"
                    role="button"
                    tabindex="0"
                    onclick={() => goto(`/${project.slug}?track=${track.id}`)}
                    onkeydown={(e) =>
                      e.key === "Enter" &&
                      goto(`/${project.slug}?track=${track.id}`)}
                  >
                    <span class="text-xs flex items-center gap-1">
                      <Music size={12} class="text-blue-300" />
                      {track.name}
                    </span>
                  </div>
                {/each}
              {:else}
                <div class="text-gray-500 text-xs italic">
                  Brak utworów w tym projekcie
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}

  {#if projects.length === 0}
    <div
      class="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-6"
      transition:fade
    >
      <div
        class="w-32 h-32 sm:w-48 sm:h-48 text-gray-600 flex items-center justify-center"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="space-y-2 text-center px-4">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-200">
          Brak projektów
        </h3>
        <p class="text-gray-400">Nie czekaj - utwórz swój pierwszy projekt!</p>
      </div>
      <button
        onclick={openCreateModal}
        class="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
      >
        <Plus size={20} />
        Utwórz projekt
      </button>
    </div>
  {/if}
</div>
<!-- </div> -->

<!-- Create Project Modal -->
{#if isCreateModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md" transition:slide>
      <h2 class="text-xl font-bold mb-6">Nowy projekt</h2>
      <form
        action="?/create"
        method="POST"
        class="space-y-4"
        onsubmit={() => {
          isCreating = true;
        }}
      >
        <input
          type="text"
          name="name"
          bind:value={newProjectName}
          placeholder="Nazwa projektu"
          class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <div class="flex gap-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={!newProjectName.trim() || isCreating}
          >
            {#if isCreating}
              <Loader2 class="animate-spin" size={20} />
            {:else}
              Utwórz
            {/if}
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onclick={() => (isCreateModalOpen = false)}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
