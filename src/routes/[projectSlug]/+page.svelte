<script lang="ts">
  import { goto } from "$app/navigation";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import {
    Calendar,
    Clock,
    ListMusic,
    Loader2,
    Music2,
    Plus,
    Trash2,
    Users,
  } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";
  import type { PageProps } from "./$types";

  // Mock data for demonstration
  let project = $state({
    id: 1,
    name: "Summer Jazz Album",
    description: "A collection of jazz standards and original compositions",
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    projects_users: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Mike Johnson" },
    ],
  });

  // let recordings = $state([
  //   {
  //     id: 1,
  //     name: "First Take - Piano Solo",
  //     duration: 185, // 3:05
  //     creator: "John Doe",
  //     created_at: "2024-01-20T14:30:00Z",
  //   },
  //   {
  //     id: 2,
  //     name: "Rhythm Section Groove",
  //     duration: 242, // 4:02
  //     creator: "Jane Smith",
  //     created_at: "2024-01-21T16:45:00Z",
  //   },
  //   {
  //     id: 3,
  //     name: "Bass Line Draft",
  //     duration: 163, // 2:43
  //     creator: "Mike Johnson",
  //     created_at: "2024-01-22T09:15:00Z",
  //   },
  //   {
  //     id: 4,
  //     name: "Saxophone Melody",
  //     duration: 198, // 3:18
  //     creator: "John Doe",
  //     created_at: "2024-01-22T11:20:00Z",
  //   },
  // ]);

  let isLoading = $state(false);
  let isCreating = $state(false);
  let isDeleting = $state(false);
  let trackToDelete: typeof data.recording | null = $state(null);
  let newSongName = $state("");

  async function createTrack() {
    isCreating = true;
    try {
      await goto(`/projects/${project.id}/track`);
    } finally {
      isCreating = false;
    }
  }

  async function deleteTrack() {
    if (!trackToDelete) return;

    // try {
    //   isDeleting = true;
    //   // await tracksService.deleteTrack(trackToDelete.id);
    //   recordings = recordings.filter((r) => r.id !== trackToDelete?.id);
    //   trackToDelete = null;
    // } catch (error) {
    //   console.error("Error deleting track:", error);
    // } finally {
    //   isDeleting = false;
    // }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const { data }: PageProps = $props();

  let searchQuery = $state("");
  let isCreateModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }
</script>

<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <Breadcrumbs project={data.project} />
  <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search songs..."
      class="w-full sm:w-64 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
    <button
      onclick={openCreateModal}
      class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <Plus size={20} />
      New Song
    </button>
  </div>
</div>

<div class="flex flex-col lg:flex-row my-4 gap-6">
  <!-- Project Sidebar -->
  <!-- <div class="w-full lg:w-80 lg:flex-shrink-0 mb-6 lg:mb-0">
    <div
      class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-lg lg:sticky lg:top-4"
    >
      <h1
        class="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
      >
        {project.name}
      </h1>
      <p class="text-gray-400 mb-6 leading-relaxed">{project.description}</p>

      <div class="space-y-4">
        <div class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <Clock class="text-blue-400" size={20} />
          <div>
            <div class="text-sm text-gray-400">Last Updated</div>
            <div class="text-white">{formatDate(project.updated_at)}</div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <Users class="text-purple-400" size={20} />
          <div>
            <div class="text-sm text-gray-400">Team Members</div>
            <div class="text-white">
              {project.projects_users.length} collaborators
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
          <Music class="text-green-400" size={20} />
          <div>
            <div class="text-sm text-gray-400">Total Tracks</div>
            <div class="text-white">{recordings.length} recordings</div>
          </div>
        </div>
      </div>
    </div>
  </div> -->

  <!-- Recording List -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {#if isLoading}
      <div class="flex items-center justify-center h-[calc(100vh-24rem)]">
        <Loader2 class="animate-spin" size={32} />
      </div>
    {:else}
      {#each data.tracks as track (track.id)}
        <div
          class="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-700/70 transition-all transform hover:-translate-y-0.5 border border-gray-700/50 gap-4"
          transition:slide
          role="button"
          tabindex="0"
          onclick={() => goto(`/${data.project.slug}/${track.slug}`)}
          onkeydown={(e) =>
            e.key === "Enter" && goto(`/${data.project.slug}/${track.slug}`)}
        >
          <div class="flex-1 w-full">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Music2 size={20} class="text-blue-400" />
                <h2 class="font-semibold text-lg">{track.name}</h2>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600/50"
                onclick={(e) => {
                  e.stopPropagation();
                  trackToDelete = track;
                }}
                title="Delete track"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div
              class="flex flex-wrap items-center gap-4 text-sm text-gray-400"
            >
              <div class="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(123)}
              </div>
              <div class="flex items-center gap-1">
                <Users size={14} />
                <!-- {track.creator} -->
                Stachu Jones
              </div>
              <div class="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(track.created_at)}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if data.tracks.length === 0}
        <div
          class="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-6"
          transition:fade
        >
          {#if searchQuery}
            <div
              class="w-32 h-32 sm:w-48 sm:h-48 text-gray-600 flex items-center justify-center"
            >
              <svg
                class="w-full h-full"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 8v4m0 4h.01"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="space-y-2 text-center px-4">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-200">
                No matching songs
              </h3>
              <p class="text-gray-400">
                We couldn't find any songs matching "{searchQuery}"
              </p>
            </div>
            <button
              onclick={() => (searchQuery = "")}
              class="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear search
            </button>
          {:else}
            <div class="text-gray-600">
              <ListMusic size={100}></ListMusic>
            </div>
            <div class="space-y-2 text-center px-4">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-200">
                No songs yet
              </h3>
              <p class="text-gray-400">Let's add some music to your project!</p>
            </div>
            <button
              onclick={openCreateModal}
              class="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              Add first song
            </button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  {#if isCreateModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
      transition:fade
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md" transition:slide>
        <h2 class="text-xl font-bold mb-6">Create New Song</h2>
        <form
          action="?/create"
          method="POST"
          class="space-y-4"
          onsubmit={() => {
            isCreating = true;
          }}
        >
          <input type="hidden" name="project_id" value={data.project.id} />
          <input
            type="text"
            name="name"
            bind:value={newSongName}
            placeholder="Song name"
            class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!newSongName.trim() || isCreating}
            >
              {#if isCreating}
                <Loader2 class="animate-spin" size={20} />
              {:else}
                Create Song
              {/if}
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              onclick={() => (isCreateModalOpen = false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if trackToDelete}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
      transition:fade
    >
      <div
        class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700/50"
        transition:slide
      >
        <h2 class="text-xl font-bold mb-4">Delete Track</h2>
        <p class="text-gray-300 mb-6">
          Are you sure you want to delete "{trackToDelete.name}"? This action
          cannot be undone.
        </p>
        <div class="flex space-x-4">
          <button
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={deleteTrack}
            disabled={isDeleting}
          >
            {#if isDeleting}
              <Loader2 class="animate-spin mx-auto" size={20} />
            {:else}
              Delete Track
            {/if}
          </button>
          <button
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onclick={() => (trackToDelete = null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
