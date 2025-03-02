<script lang="ts">
  import { goto } from "$app/navigation";
  import { generateSlug } from "$lib/utils/slug";
  import {
    Calendar,
    Clock,
    Loader2,
    Music,
    Music2,
    Plus,
    Trash2,
    Users,
  } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

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

  let recordings = $state([
    {
      id: 1,
      name: "First Take - Piano Solo",
      duration: 185, // 3:05
      creator: "John Doe",
      created_at: "2024-01-20T14:30:00Z",
    },
    {
      id: 2,
      name: "Rhythm Section Groove",
      duration: 242, // 4:02
      creator: "Jane Smith",
      created_at: "2024-01-21T16:45:00Z",
    },
    {
      id: 3,
      name: "Bass Line Draft",
      duration: 163, // 2:43
      creator: "Mike Johnson",
      created_at: "2024-01-22T09:15:00Z",
    },
    {
      id: 4,
      name: "Saxophone Melody",
      duration: 198, // 3:18
      creator: "John Doe",
      created_at: "2024-01-22T11:20:00Z",
    },
  ]);

  let isLoading = $state(false);
  let isCreating = $state(false);
  let isDeleting = $state(false);
  let trackToDelete: (typeof recordings)[0] | null = $state(null);

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

    try {
      isDeleting = true;
      // await tracksService.deleteTrack(trackToDelete.id);
      recordings = recordings.filter((r) => r.id !== trackToDelete?.id);
      trackToDelete = null;
    } catch (error) {
      console.error("Error deleting track:", error);
    } finally {
      isDeleting = false;
    }
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
</script>

<div class="flex flex-col lg:flex-row mx-4 my-4 gap-6">
  <!-- Project Sidebar -->
  <div class="w-full lg:w-80 lg:flex-shrink-0 mb-6 lg:mb-0">
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
  </div>

  <!-- Recording List -->
  <div class="flex-1 space-y-4">
    {#if isLoading}
      <div class="flex items-center justify-center h-[calc(100vh-24rem)]">
        <Loader2 class="animate-spin" size={32} />
      </div>
    {:else}
      {#each recordings as recording (recording.id)}
        <div
          class="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-700/70 transition-all transform hover:-translate-y-0.5 border border-gray-700/50 gap-4"
          transition:slide
          role="button"
          tabindex="0"
          onclick={() =>
            goto(
              `/${generateSlug(project.name)}/${generateSlug(recording.name)}`,
            )}
          onkeydown={(e) =>
            e.key === "Enter" &&
            goto(
              `/${generateSlug(project.name)}/${generateSlug(recording.name)}`,
            )}
        >
          <div class="flex-1 w-full">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Music2 size={20} class="text-blue-400" />
                <h2 class="font-semibold text-lg">{recording.name}</h2>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600/50"
                onclick={(e) => {
                  e.stopPropagation();
                  trackToDelete = recording;
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
                {formatTime(recording.duration)}
              </div>
              <div class="flex items-center gap-1">
                <Users size={14} />
                {recording.creator}
              </div>
              <div class="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(recording.created_at)}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if recordings.length === 0}
        <div
          class="flex flex-col items-center justify-center h-[calc(100vh-24rem)] text-gray-400"
        >
          <Music size={48} class="mb-4 text-gray-500" />
          <p class="text-lg mb-2">No recordings yet</p>
          <p class="text-sm mb-6">
            Start by adding your first track to this project
          </p>
          <button
            onclick={createTrack}
            class="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Plus size={20} />
            Add Your First Track
          </button>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Add Recording Button (shown when there are recordings) -->
  {#if recordings.length > 0}
    <button
      class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={createTrack}
      disabled={isCreating}
      title="Add recording"
    >
      {#if isCreating}
        <Loader2 size={24} class="animate-spin" />
      {:else}
        <Plus size={24} />
      {/if}
    </button>
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
