<script lang="ts">
  import NewProjectModal from "$lib/components/projects/NewProjectModal.svelte";
  import NoProjectsView from "$lib/components/projects/NoProjectsView.svelte";
  import ProjectCard from "$lib/components/projects/ProjectCard.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { Plus } from "lucide-svelte";

  let { data } = $props();
  let projects = data.data;

  let isCreateProjectModalOpened = $state(false);

  const hasProjects = $derived(projects.length > 0);
</script>

<div class="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
  {#if hasProjects}
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold">Moje Projekty</h1>
        <p class="text-gray-400 mt-1">
          Zarządzaj i organizuj swoje projekty muzyczne
        </p>
      </div>

      <Button
        onclick={() => (isCreateProjectModalOpened = true)}
        primary
        class="w-full sm:w-auto"
      >
        <Plus size={20} />
        <span>Nowy Projekt</span>
      </Button>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      {#each projects as project (project.id)}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <div class="h-full flex items-center justify-center">
      <NoProjectsView
        onCreateProject={() => (isCreateProjectModalOpened = true)}
      />
    </div>
  {/if}
</div>

<NewProjectModal bind:isOpen={isCreateProjectModalOpened} />
