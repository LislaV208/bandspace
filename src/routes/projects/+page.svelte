<script lang="ts">
  import { Plus, Play, Pause, User } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';

  type Project = {
    id: number;
    name: string;
    lastRecording: string | null;
    isPlaying: boolean;
  };
  
  let projects: Project[] = [
    { id: 1, name: 'Rehearsal #3', lastRecording: 'guitar_solo.mp3', isPlaying: false },
    { id: 2, name: 'Jazz Session', lastRecording: 'piano_take2.mp3', isPlaying: false },
    { id: 3, name: 'Band Practice', lastRecording: 'full_band.mp3', isPlaying: false }
  ];

  let isCreateModalOpen = false;
  let newProjectName = '';

  function togglePlay(project: Project) {
    projects = projects.map(p => ({
      ...p,
      isPlaying: p.id === project.id ? !p.isPlaying : false
    }));
  }

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function createProject() {
    if (newProjectName.trim()) {
      projects = [...projects, {
        id: projects.length + 1,
        name: newProjectName,
        lastRecording: null,
        isPlaying: false
      }];
      newProjectName = '';
      isCreateModalOpen = false;
    }
  }

  function logout() {
    // Mock logout functionality
    console.log('Logging out...');
    goto('/login');
  }
</script>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <header class="bg-gray-800 px-4 py-4 flex items-center justify-between shadow-lg">
    <h1 class="text-2xl font-bold">BandSpace</h1>
    <button
      on:click={logout}
      class="p-2 hover:bg-gray-700 rounded-full transition-colors"
      title="User menu"
    >
      <User size={24} />
    </button>
  </header>

  <!-- Project List -->
  <div class="max-w-3xl mx-auto px-4 py-6">
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
          <div class="flex items-center space-x-4">
            <button
              class="p-2 rounded-full {project.isPlaying ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} transition-colors"
              on:click|stopPropagation={() => togglePlay(project)}
              title={project.isPlaying ? 'Pause' : 'Play'}
            >
              {#if project.isPlaying}
                <Pause size={20} />
              {:else}
                <Play size={20} />
              {/if}
              
            </button>
            <div>
              <h2 class="font-semibold text-lg">{project.name}</h2>
              {#if project.lastRecording}
                <p class="text-sm text-gray-400">Latest: {project.lastRecording}</p>
              {/if}
              
            </div>
          </div>
        </div>
      {/each}
      
    </div>
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
              class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
</div>