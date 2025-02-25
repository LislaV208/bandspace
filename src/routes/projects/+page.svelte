<script lang="ts">
  import { Plus, Loader2, Trash2 } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { type Project, projectsService } from '$lib/services/projects';

  let projects: Project[] = [];
  let isCreateModalOpen = false;
  let newProjectName = '';
  let error: string | null = null;
  let isLoading = true;
  let isCreating = false;
  let isDeleting = false;
  let projectToDelete: Project | null = null;

  onMount(async () => {
    try {
      projects = await projectsService.getProjects();
    } catch (e) {
      error = 'Failed to load projects';
      console.error('Error loading projects:', e);
    } finally {
      isLoading = false;
    }
  });

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  async function createProject() {
    if (newProjectName.trim() && !isCreating) {
      isCreating = true;
      try {
        const newProject = await projectsService.createProject(newProjectName);
        projects = [...projects, newProject];
        
        newProjectName = '';
        isCreateModalOpen = false;
      } catch (e) {
        error = 'Failed to create project';
        console.error('Error creating project:', e);
      } finally {
        isCreating = false;
      }
    }
  }

  async function deleteProject() {
    if (!projectToDelete || isDeleting) return;

    try {
      isDeleting = true;
      await projectsService.deleteProject(projectToDelete.id);
      projects = projects.filter(p => p.id !== projectToDelete?.id);
      projectToDelete = null;
    } catch (e) {
      error = 'Failed to delete project';
      console.error('Error deleting project:', e);
    } finally {
      isDeleting = false;
    }
  }
</script>

  <!-- Project List -->
  <div class="max-w-3xl mx-auto px-4 py-6">
    {#if error}
      <div class="bg-red-500 text-white p-4 rounded-lg mb-4">
        {error}
      </div>
    {/if}

    {#if isLoading}
      <div class="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 class="animate-spin" size={32} />
      </div>
    {:else}
      <div class="space-y-4">
        {#each projects as project (project.id)}
          <div
            class="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
            transition:slide
          >
            <button
              class="flex-1 text-left font-semibold text-lg"
              on:click={() => goto(`/projects/${project.id}`)}
            >
              {project.name}
            </button>
            <button
              class="p-2 text-gray-400 hover:text-red-500 transition-colors"
              on:click={() => projectToDelete = project}
              title="Delete project"
            >
              <Trash2 size={20} />
            </button>
          </div>
        {/each}

        {#if projects.length === 0}
          <div class="flex items-center justify-center h-[calc(100vh-12rem)]">
            <div class="text-gray-400">
              No projects yet - create your first!
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Create Project Button -->
    <button
      class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={openCreateModal}
      disabled={isCreating}
      title="Create project"
    >
      {#if isCreating}
        <Loader2 size={24} class="animate-spin" />
      {:else}
        <Plus size={24} />
      {/if}
    </button>

    <!-- Create Project Modal -->
    {#if isCreateModalOpen}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        transition:fade
      >
        <div
          class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          transition:slide
        >
          <h2 class="text-xl font-bold mb-6">Create Project</h2>
          <form on:submit|preventDefault={createProject} class="space-y-4">
            <input
              type="text"
              bind:value={newProjectName}
              placeholder="Project name"
              class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div class="flex space-x-4">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newProjectName.trim() || isCreating}
              >
                {#if isCreating}
                  <Loader2 class="animate-spin mx-auto" size={20} />
                {:else}
                  Create
                {/if}
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                on:click={() => isCreateModalOpen = false}
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
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        transition:fade
      >
        <div
          class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          transition:slide
        >
          <h2 class="text-xl font-bold mb-4">Delete Project</h2>
          <p class="text-gray-300 mb-6">Are you sure you want to delete "{projectToDelete.name}"? This action cannot be undone.</p>
          <div class="flex space-x-4">
            <button
              class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              on:click={deleteProject}
              disabled={isDeleting}
            >
              {#if isDeleting}
                <Loader2 class="animate-spin mx-auto" size={20} />
              {:else}
                Delete
              {/if}
            </button>
            <button
              class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              on:click={() => projectToDelete = null}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>