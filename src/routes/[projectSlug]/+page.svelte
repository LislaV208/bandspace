<script lang="ts">
  import { enhance } from "$app/forms";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import DeleteProjectModal from "$lib/components/projects/DeleteProjectModal.svelte";
  import LeaveProjectModal from "$lib/components/projects/LeaveProjectModal.svelte";
  import ProjectInviteModal from "$lib/components/projects/ProjectInviteModal.svelte";
  import ProjectMembersModal from "$lib/components/projects/ProjectMembersModal.svelte";
  import DeleteTrackModal from "$lib/components/tracks/DeleteTrackModal.svelte";
  import NewTrackModal from "$lib/components/tracks/NewTrackModal.svelte";

  import ProjectActionButton from "$lib/components/projects/ProjectActionButton.svelte";
  import TrackList from "$lib/components/tracks/TrackList.svelte";

  import { setSupabaseContext } from "$lib/supabase-context";
  import type { Track } from "$lib/types/track";
  import { LogOut, Share2, Trash2, Users } from "lucide-svelte";
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
  class="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
>
  <div class="p-6 sm:p-8 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-10">
      <div>
        <Breadcrumbs project={data.project} />
      </div>

      <div class="flex gap-2">
        <ProjectActionButton
          icon={Share2}
          onclick={() => (isInviteModalOpen = true)}
        >
          Udostępnij
        </ProjectActionButton>
        <ProjectActionButton
          icon={Users}
          onclick={() => (isUsersModalOpen = true)}
        >
          Członkowie
        </ProjectActionButton>
        <ProjectActionButton
          icon={LogOut}
          onclick={() => (isLeaveModalOpen = true)}
        >
          Opuść
        </ProjectActionButton>
        <ProjectActionButton
          icon={Trash2}
          onclick={() => (isDeleteProjectModalOpen = true)}
        >
          Usuń
        </ProjectActionButton>
      </div>
    </div>

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
