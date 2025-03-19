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

<div
  class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
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

<div class="container mx-auto">
  <div
    class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6 mx-auto"
  >
    {#each projects as project (project.id)}
      <ProjectCard {project} />
    {/each}

    {#if projects.length === 0}
      <NoProjectsView
        onCreateProject={() => (isCreateProjectModalOpened = true)}
      />
    {/if}
  </div>
</div>

<NewProjectModal bind:isOpen={isCreateProjectModalOpened} />
