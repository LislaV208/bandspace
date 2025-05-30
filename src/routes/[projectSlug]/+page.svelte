<script lang="ts">
  import { enhance } from "$app/forms";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import DeleteProjectModal from "$lib/components/projects/DeleteProjectModal.svelte";
  import EditProjectModal from "$lib/components/projects/EditProjectModal.svelte";
  import LeaveProjectModal from "$lib/components/projects/LeaveProjectModal.svelte";
  import ProjectInviteModal from "$lib/components/projects/ProjectInviteModal.svelte";
  import ProjectMembersModal from "$lib/components/projects/ProjectMembersModal.svelte";
  import DeleteTrackModal from "$lib/components/tracks/DeleteTrackModal.svelte";
  import NewTrackModal from "$lib/components/tracks/NewTrackModal.svelte";

  import ProjectActionButton from "$lib/components/projects/ProjectActionButton.svelte";
  import TrackList from "$lib/components/tracks/TrackList.svelte";

  import { setSupabaseContext } from "$lib/supabase-context";
  import type { Track } from "$lib/types/track";
  import { Edit, LogOut, Share2, Trash2, Users } from "lucide-svelte";
  import type { PageProps } from "./$types";

  let trackToDelete: Track | null = $state(null);
  let isDeleteTrackModalOpen = $state(false);

  let isLeaveModalOpen = $state(false);
  let isDeleteProjectModalOpen = $state(false);
  let isUsersModalOpen = $state(false);
  let isEditProjectModalOpen = $state(false);

  const { data }: PageProps = $props();
  const supabase = data.supabase;
  const project = data.project;
  const projectUsers = data.projectUsers;
  const categories = data.categories;

  // Usunięto pobieranie sluga projektu z parametrów URL, ponieważ nie jest już potrzebne

  setSupabaseContext(supabase);

  // Usunięto inicjalizację DataTable, używamy teraz komponentu TrackList

  let isCreateModalOpen = $state(false);
  let isInviteModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }
</script>

<div class="h-full scrollbar-stable">
  <div class="p-6 sm:p-8 max-w-7xl mx-auto">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10"
    >
      <div>
        <Breadcrumbs project={data.project} />
      </div>

      <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
        <ProjectActionButton
          icon={Edit}
          onclick={() => (isEditProjectModalOpen = true)}
        >
          <span class="sm:hidden md:inline">Edytuj</span>
          <span class="hidden sm:inline md:hidden">Edytuj</span>
        </ProjectActionButton>
        <ProjectActionButton
          icon={Share2}
          onclick={() => (isInviteModalOpen = true)}
        >
          <span class="sm:hidden md:inline">Udostępnij</span>
          <span class="hidden sm:inline md:hidden">Udostępnij</span>
        </ProjectActionButton>
        <ProjectActionButton
          icon={Users}
          onclick={() => (isUsersModalOpen = true)}
        >
          <span class="sm:hidden md:inline">Członkowie</span>
          <span class="hidden sm:inline md:hidden">Członkowie</span>
        </ProjectActionButton>
        <ProjectActionButton
          icon={LogOut}
          onclick={() => (isLeaveModalOpen = true)}
        >
          <span class="sm:hidden md:inline">Opuść</span>
          <span class="hidden sm:inline md:hidden">Opuść</span>
        </ProjectActionButton>
        <ProjectActionButton
          icon={Trash2}
          onclick={() => (isDeleteProjectModalOpen = true)}
        >
          <span class="sm:hidden md:inline">Usuń</span>
          <span class="hidden sm:inline md:hidden">Usuń</span>
        </ProjectActionButton>
      </div>
    </div>

    <TrackList
      tracks={data.tracks}
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
<EditProjectModal {project} bind:isOpen={isEditProjectModalOpen} />
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
