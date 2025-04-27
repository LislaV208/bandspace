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

<div class="p-6 sm:p-8 max-w-7xl mx-auto">
  <div class="flex justify-between items-center mb-4">
    <div>
      <h1 class="text-2xl font-bold">Moje Projekty</h1>
      <p class="text-gray-400 mt-1">
        Zarządzaj i organizuj swoje projekty muzyczne
      </p>
    </div>

    <Button onclick={() => (isCreateProjectModalOpened = true)} primary>
      <Plus size={20} />
      Nowy Projekt
    </Button>
  </div>

  {#if hasProjects}
    <div class="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-6 mt-6">
      {#each projects as project (project.id)}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <NoProjectsView
      onCreateProject={() => (isCreateProjectModalOpened = true)}
    />
  {/if}
</div>

<NewProjectModal bind:isOpen={isCreateProjectModalOpened} />
