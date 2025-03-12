<script lang="ts">
  import { goto } from "$app/navigation";
  import { Clock, Loader2, Music, Plus, Trash2, Users } from "lucide-svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";

  let { data, form } = $props();
  let projects = data.data;

  $effect(() => {
    if (form?.error) {
      toast.error(form?.error, {
        position: "bottom-right",
      });
    }
  });

  let isCreateModalOpen = $state(false);
  let newProjectName = $state("");
  let isCreating = $state(false);
  let isDeleting = $state(false);
  let projectToDelete: (typeof projects)[0] | null = $state(null);

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

<!-- <div class="max-w-6xl mx-auto px-4 py-8"> -->
<!-- <div class="container mx-auto px-4 py-6 sm:py-8"> -->
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

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {#each projects as project (project.id)}
    <div class="relative" transition:slide>
      <div
        role="button"
        tabindex="0"
        class="w-full text-left bg-gray-800 rounded-lg p-4 sm:p-6 hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl"
        onclick={() => goto(`/${project.slug}`)}
        onkeydown={(e) => e.key === "Enter" && goto(`/${project.slug}`)}
      >
        <div class="flex justify-between items-start mb-4 pr-12">
          <div
            class="text-lg sm:text-xl font-semibold hover:text-blue-400 transition-colors text-left"
          >
            {project.name}
          </div>
          <button
            type="button"
            class="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600/50"
            onclick={(e) => {
              e.stopPropagation();
              projectToDelete = project;
            }}
            title="Delete project"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div
          class="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-400 text-sm"
        >
          <div class="flex items-center gap-1">
            <Clock size={16} />
            {formatDate(project.updated_at)}
          </div>
          <div class="flex items-center gap-1">
            <Users size={16} />
            {project.projects_users?.length}
          </div>
          <div class="flex items-center gap-1">
            <Music size={16} />
            Brak utworów
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

<!-- Delete Confirmation Modal -->
{#if projectToDelete}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md" transition:slide>
      <h2 class="text-xl font-bold mb-4">Usuń projekt</h2>
      <p class="text-gray-300 mb-6">
        Czy na pewno chcesz usunąć "{projectToDelete.name}"? Tej czynności nie
        można cofnąć.
      </p>
      <form
        action="?/delete"
        method="POST"
        class="flex gap-4"
        onsubmit={() => {
          isDeleting = true;
        }}
      >
        <input type="hidden" name="id" value={projectToDelete.id} />
        <button
          type="submit"
          class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isDeleting}
        >
          {#if isDeleting}
            <Loader2 class="animate-spin" size={20} />
          {:else}
            Usuń
          {/if}
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onclick={() => (projectToDelete = null)}
        >
          Anuluj
        </button>
      </form>
    </div>
  </div>
{/if}
