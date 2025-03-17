<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/Button.svelte";
  import CardButton from "$lib/components/ui/CardButton.svelte";
  import { Music, Plus, Users } from "lucide-svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade } from "svelte/transition";
  import NewProjectModal from "./NewProjectModal.svelte";

  let { data, form } = $props();
  let projects = data.data;

  if (form?.error) {
    toast.error(form?.error, {
      position: "bottom-right",
    });
  }

  let isCreateProjectModalOpened = $state(false);

  const hasProjects = $derived(projects.length > 0);
</script>

<Toaster />

<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <h1 class="text-2xl">Projekty</h1>
  {#if hasProjects}
    <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
      <Button onclick={() => (isCreateProjectModalOpened = true)} primary>
        <Plus size={20} />
        Nowy projekt
      </Button>
    </div>
  {/if}
</div>

<div
  class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6 mx-auto"
>
  {#each projects as project (project.id)}
    <CardButton onclick={() => goto(`/${project.slug}`)}>
      <div class="flex justify-between items-start gap-3">
        <div class="flex items-center gap-3">
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
      </div>
      <div class="mt-4 mb-3 border-t border-gray-700"></div>
      <div class="text-sm">
        <div class="text-gray-300 font-medium mb-2">Ostatnie utwory:</div>
        <div class="flex flex-wrap gap-2">
          {#if project.recent_tracks && project.recent_tracks.length > 0}
            {#each project.recent_tracks as track}
              <div
                class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-700 border border-gray-600 text-gray-200 transition-colors hover:bg-gray-600 cursor-pointer"
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
    </CardButton>
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
      <Button primary onclick={() => (isCreateProjectModalOpened = true)}>
        <Plus size={20} />
        Utwórz projekt
      </Button>
    </div>
  {/if}
</div>

<NewProjectModal bind:isOpen={isCreateProjectModalOpened} />
