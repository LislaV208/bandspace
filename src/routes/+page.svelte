<script lang="ts">
  import { goto } from "$app/navigation";
  import { Clock, Loader2, Music, Plus, Trash2, Users } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

  let { data } = $props();
  let projects = data.data;

  $inspect(projects);

  // Mock data for demonstration
  // let projects = $state([
  //   {
  //     id: 1,
  //     name: "Summer Jazz Album",
  //     category: "Jazz",
  //     lastModified: "2024-01-15",
  //     collaborators: 3,
  //     tracks: 8,
  //   },
  //   {
  //     id: 2,
  //     name: "Rock Fusion Project",
  //     category: "Rock",
  //     lastModified: "2024-01-14",
  //     collaborators: 2,
  //     tracks: 5,
  //   },
  //   {
  //     id: 3,
  //     name: "Electronic Beats",
  //     category: "Electronic",
  //     lastModified: "2024-01-13",
  //     collaborators: 4,
  //     tracks: 12,
  //   },
  //   {
  //     id: 4,
  //     name: "Acoustic Sessions",
  //     category: "Acoustic",
  //     lastModified: "2024-01-12",
  //     collaborators: 1,
  //     tracks: 6,
  //   },
  // ]);

  let isCreateModalOpen = $state(false);
  let newProjectName = $state("");
  let isCreating = $state(false);
  let isDeleting = $state(false);
  let projectToDelete: (typeof projects)[0] | null = $state(null);
  let searchQuery = $state("");

  // $derived.filteredProjects = projects.filter((project) =>
  //   project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  const filteredProjects = $derived.by(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  });

  const hasProjects = $derived(projects.length > 0);

  $inspect(hasProjects);

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<!-- <div class="max-w-6xl mx-auto px-4 py-8"> -->
<div class="flex justify-between items-center mb-8">
  <h1 class="text-2xl">Projects</h1>
  {#if hasProjects}
    <div class="flex gap-4">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search projects..."
        class="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        onclick={openCreateModal}
        class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus size={20} />
        New Project
      </button>
    </div>
  {/if}
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each filteredProjects as project (project.id)}
    <div
      class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-xl"
      transition:slide
    >
      <div class="flex justify-between items-start mb-4">
        <button
          class="text-xl font-semibold hover:text-blue-400 transition-colors text-left"
          onclick={() => goto(`/${project.id}`)}
        >
          {project.name}
        </button>
        <button
          class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600"
          onclick={() => (projectToDelete = project)}
          title="Delete project"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div class="flex items-center gap-4 text-gray-400 text-sm">
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
          <!-- {project.tracks} tracks -->
          No tracks
        </div>
      </div>
    </div>
  {/each}

  {#if filteredProjects.length === 0}
    <div
      class="col-span-full flex flex-col items-center justify-center py-16 space-y-6"
      transition:fade
    >
      {#if searchQuery}
        <div class="w-48 h-48 text-gray-600 flex items-center justify-center">
          <svg
            class="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 8v4m0 4h.01"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="space-y-2 text-center">
          <h3 class="text-xl font-semibold text-gray-200">
            No matching projects
          </h3>
          <p class="text-gray-400">
            We couldn't find any projects matching "{searchQuery}"
          </p>
        </div>
        <button
          onclick={() => (searchQuery = "")}
          class="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Clear search
        </button>
      {:else}
        <div class="w-48 h-48 text-gray-600 flex items-center justify-center">
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
        <div class="space-y-2 text-center">
          <h3 class="text-xl font-semibold text-gray-200">No projects yet</h3>
          <p class="text-gray-400">
            Start creating your first project and begin your musical journey!
          </p>
        </div>
        <button
          onclick={openCreateModal}
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          Create Your First Project
        </button>
      {/if}
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
      <h2 class="text-xl font-bold mb-6">Create New Project</h2>
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
          placeholder="Project name"
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
              Create Project
            {/if}
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onclick={() => (isCreateModalOpen = false)}
          >
            Cancel
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
      <h2 class="text-xl font-bold mb-4">Delete Project</h2>
      <p class="text-gray-300 mb-6">
        Are you sure you want to delete "{projectToDelete.name}"? This action
        cannot be undone.
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
            Delete Project
          {/if}
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onclick={() => (projectToDelete = null)}
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
{/if}
