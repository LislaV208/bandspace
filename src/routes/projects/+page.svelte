<script lang="ts">
  import { Plus, Loader2 } from 'lucide-svelte';
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
          role="button"
          tabindex="0"
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              goto(`/projects/${project.id}`);
            }
          }}
          class="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors cursor-pointer"
          transition:slide
          on:click={() => goto(`/projects/${project.id}`)}
        >
          <div>
            <h2 class="font-semibold text-lg">{project.name}</h2>
          </div>
        </div>
      {/each}

      {#if projects.length === 0 && !error}
        <div class="flex items-center justify-center h-[calc(100vh-12rem)] text-gray-400">
          No projects yet - create your first one!
        </div>
      {/if}
      </div>
    {/if}
  </div>

  <!-- New Project Button -->
  <button
    class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
    on:click={openCreateModal}
    title="Create new project"
  >
    <Plus size={24} />
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
        <h2 class="text-xl font-bold mb-4">Create New Project</h2>
        <form on:submit|preventDefault={createProject}>
          <input
            type="text"
            bind:value={newProjectName}
            placeholder="Project name"
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              class="px-4 py-2 text-gray-300 hover:text-white"
              on:click={() => isCreateModalOpen = false}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-medium flex items-center justify-center min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {#if isCreating}
                <Loader2 class="animate-spin" size={18} />
              {:else}
                Create
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}