<script lang="ts">
  import { goto } from "$app/navigation";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import DeleteProjectModal from "$lib/components/projects/DeleteProjectModal.svelte";
  import LeaveProjectModal from "$lib/components/projects/LeaveProjectModal.svelte";
  import ProjectInviteModal from "$lib/components/projects/ProjectInviteModal.svelte";
  import ProjectMembersModal from "$lib/components/projects/ProjectMembersModal.svelte";
  import DeleteTrackModal from "$lib/components/tracks/DeleteTrackModal.svelte";
  import EditTrackModal from "$lib/components/tracks/EditTrackModal.svelte";
  import NewTrackModal from "$lib/components/tracks/NewTrackModal.svelte";
  import NoTracksView from "$lib/components/tracks/NoTracksView.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PopupMenu from "$lib/components/ui/popup/PopupMenu.svelte";
  import PopupMenuOption from "$lib/components/ui/popup/PopupMenuOption.svelte";
  import { setSupabaseContext } from "$lib/supabase-context";
  import type { Track } from "$lib/types/track";
  import {
    FileMusic,
    ListMusic,
    LogOut,
    Pencil,
    Plus,
    Settings,
    Share2,
    Trash2,
    Users,
  } from "lucide-svelte";
  import { Toaster } from "svelte-french-toast";
  import type { PageProps } from "./$types";

  let trackToDelete: Track | null = $state(null);
  let trackToEdit: Track | null = $state(null);
  let isDeleteTrackModalOpen = $state(false);
  let isEditTrackModalOpen = $state(false);
  let isLeaveModalOpen = $state(false);
  let isDeleteProjectModalOpen = $state(false);
  let isUsersModalOpen = $state(false);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pl", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  const { data }: PageProps = $props();
  const supabase = data.supabase;
  const project = data.project;
  const projectUsers = data.projectUsers;
  const categories = data.categories;

  setSupabaseContext(supabase);

  let tracks = $state(data.tracks);
  let sortField = $state("date");
  let sortDirection = $state("desc");

  function sortTracks(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "desc";
    }

    tracks = [...tracks].sort((a, b) => {
      const valA = a[field as keyof typeof a];
      const valB = b[field as keyof typeof b];

      if (valA === null || valB === null) {
        return valA === null ? 1 : -1;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === "string" && typeof valB === "string") {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortDirection === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
      }

      return 0;
    });
  }

  let searchQuery = $state("");

  $effect(() => {
    if (!searchQuery) {
      tracks = data.tracks;
      return;
    }

    const query = searchQuery.toLowerCase();
    tracks = data.tracks.filter((track) =>
      track.name.toLowerCase().includes(query),
    );
  });

  let isCreateModalOpen = $state(false);
  let isInviteModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }
</script>

<Toaster />

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
  {#if data.tracks.length === 0}
    <NoTracksView onAddTrack={openCreateModal} />
  {:else}
    <div class="w-full">
      <!-- class="w-full bg-gray-800/70 rounded-lg overflow-hidden border border-gray-700/50" -->
      <div class="w-full">
        <!-- Panel wyszukiwania -->
        <div class="mb-4">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Szukaj..."
              class="w-full px-3 py-2 bg-gray-800/70 border border-gray-700/50 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              bind:value={searchQuery}
            />
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Nagłówki sortowania -->
        <div class="flex items-center justify-between mb-2 px-2">
          <button
            class="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
            onclick={() => sortTracks("name")}
          >
            Nazwa utworu
            <span class="ml-2">
              {#if sortField === "name"}
                {sortDirection === "asc" ? "↑" : "↓"}
              {:else}
                ↕
              {/if}
            </span>
          </button>

          <button
            class="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
            onclick={() => sortTracks("created_at")}
          >
            Data dodania
            <span class="ml-2">
              {#if sortField === "created_at"}
                {sortDirection === "asc" ? "↑" : "↓"}
              {:else}
                ↕
              {/if}
            </span>
          </button>
        </div>

        <!-- Lista utworów -->
        <div class="space-y-2">
          {#if tracks.length === 0}
            <div class="px-4 py-8 text-center text-gray-400">
              <div class="flex flex-col items-center justify-center space-y-2">
                <ListMusic size={40} class="text-gray-600" />
                {#if searchQuery}
                  <p>Nie znaleziono utworów pasujących do wyszukiwania</p>
                  <button
                    class="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                    onclick={() => (searchQuery = "")}
                  >
                    Wyczyść filtr
                  </button>
                {:else}
                  <p>Brak utworów w tym projekcie</p>
                {/if}
              </div>
            </div>
          {:else}
            {#each tracks as track (track.id)}
              {@const trackSlug = "slug" in track ? track.slug : ""}
              <div
                class="flex items-center justify-between p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer border border-gray-700/30"
                onclick={() => goto(`/${data.project.slug}/${trackSlug}`)}
                onkeydown={(e) =>
                  e.key === "Enter" &&
                  goto(`/${data.project.slug}/${trackSlug}`)}
                tabindex="0"
              >
                <div class="flex items-center gap-3">
                  <FileMusic size={20} class="text-blue-400" />
                  <div>
                    <div class="font-medium">
                      {"name" in track ? track.name : "-"}
                    </div>
                    <div class="text-sm text-gray-400">
                      {"created_at" in track
                        ? formatDate(track.created_at)
                        : ""}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded hover:bg-gray-600/50"
                    onclick={(e) => {
                      e.stopPropagation();
                      trackToEdit = track;
                      isEditTrackModalOpen = true;
                    }}
                    title="Edytuj utwór"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-600/50"
                    onclick={(e) => {
                      e.stopPropagation();
                      trackToDelete = track;
                      isDeleteTrackModalOpen = true;
                    }}
                    title="Usuń utwór"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}
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
<EditTrackModal
  track={trackToEdit}
  bind:isOpen={isEditTrackModalOpen}
  onClose={() => {
    isEditTrackModalOpen = false;
    trackToEdit = null;
    window.location.reload();
  }}
/>
