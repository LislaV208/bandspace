<script lang="ts">
  import { enhance } from "$app/forms";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import DeleteProjectModal from "$lib/components/projects/DeleteProjectModal.svelte";
  import LeaveProjectModal from "$lib/components/projects/LeaveProjectModal.svelte";
  import ProjectInviteModal from "$lib/components/projects/ProjectInviteModal.svelte";
  import ProjectMembersModal from "$lib/components/projects/ProjectMembersModal.svelte";
  import DeleteTrackModal from "$lib/components/tracks/DeleteTrackModal.svelte";
  import NewTrackModal from "$lib/components/tracks/NewTrackModal.svelte";

  import TrackList from "$lib/components/tracks/TrackList.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PopupMenu from "$lib/components/ui/popup/PopupMenu.svelte";
  import PopupMenuOption from "$lib/components/ui/popup/PopupMenuOption.svelte";

  import { setSupabaseContext } from "$lib/supabase-context";
  import type { Track } from "$lib/types/track";
  import { LogOut, Plus, Settings, Share2, Trash2, Users } from "lucide-svelte";
  import type { PageProps } from "./$types";

  let trackToDelete: Track | null = $state(null);
  let isDeleteTrackModalOpen = $state(false);

  let isLeaveModalOpen = $state(false);
  let isDeleteProjectModalOpen = $state(false);
  let isUsersModalOpen = $state(false);

  const { data }: PageProps = $props();
  const supabase = data.supabase;
  const project = data.project;
  const projectUsers = data.projectUsers;
  const categories = data.categories;

  setSupabaseContext(supabase);

  // Usunięto inicjalizację DataTable, używamy teraz komponentu TrackList

  let isCreateModalOpen = $state(false);
  let isInviteModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }
</script>

<div
  class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <Breadcrumbs project={data.project} />

  <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
    {#if data.tracks.length !== 0}
      <button
        onclick={openCreateModal}
        class="w-full h-10 sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Nowy utwór
      </button>
    {/if}
    <Button icon={Share2} onclick={() => (isInviteModalOpen = true)}
      >Zaproś do projektu</Button
    >
    <PopupMenu>
      {#snippet triggerContent(onclick)}
        <Button icon={Settings} {onclick}></Button>
      {/snippet}
      <PopupMenuOption
        icon={Users}
        text="Członkowie projektu"
        onclick={() => (isUsersModalOpen = true)}
      />
      <PopupMenuOption
        icon={LogOut}
        text="Opuść projekt"
        onclick={() => (isLeaveModalOpen = true)}
      />
      <PopupMenuOption
        icon={Trash2}
        className="hover:text-red-500"
        text="Usuń projekt"
        onclick={() => (isDeleteProjectModalOpen = true)}
      />
    </PopupMenu>
  </div>
</div>

<div class="container mx-auto flex flex-col lg:flex-row my-4 gap-6">
  <div class="w-full">
    <TrackList
      tracks={data.tracks}
      categories={data.categories}
      projectSlug={project.slug}
      onNewTrack={openCreateModal}
      onDeleteTrack={(track) => {
        trackToDelete = track;
        isDeleteTrackModalOpen = true;
      }}
    />
  </div>
</div>

<ProjectInviteModal {project} bind:isOpen={isInviteModalOpen} />
<ProjectMembersModal bind:isOpen={isUsersModalOpen} {projectUsers} />
<LeaveProjectModal {project} bind:isOpen={isLeaveModalOpen} />
<DeleteProjectModal {project} bind:isOpen={isDeleteProjectModalOpen} />
<DeleteTrackModal
  track={trackToDelete}
  bind:isOpen={isDeleteTrackModalOpen}
  onClose={() => {
    isDeleteTrackModalOpen = false;
    trackToDelete = null;
    window.location.reload();
  }}
/>
<NewTrackModal bind:isOpen={isCreateModalOpen} {project} {categories} />
