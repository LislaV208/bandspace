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
  let selectedFile = $state<File | null>(null);
  let isDragging = $state(false);

  function handleFileSelect(event: Event) {
    console.log("handleFileSelect");
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFile = input.files[0];
      newSongName = selectedFile.name.replace(/\.[^/.]+$/, "");
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      // Check if file is audio
      if (file.type.startsWith("audio/")) {
        selectedFile = file;
        newSongName = file.name.replace(/\.[^/.]+$/, "");

        // Update the hidden file input to reflect the dropped file
        const fileInput = document.getElementById(
          "audio-file",
        ) as HTMLInputElement;
        if (fileInput) {
          // Create a new DataTransfer object and add our file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
        }
      } else {
        // Could add error handling for non-audio files here
        console.error("Please upload an audio file");
      }
    }
  }

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

  function closeCreateModal() {
    isCreateModalOpen = false;
    newSongName = "";
    selectedFile = null;
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
  {#if data.tracks.length === 0}
    <div
      class="w-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-6"
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
  {:else}
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
      {/if}
    </div>
  {/if}
</div>

{#if isCreateModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md ${isDragging
        ? 'border-2 border-blue-400 bg-blue-950'
        : ''}"
      transition:slide
    >
      <h2 class="text-xl font-bold mb-6">
        {isDragging ? "Drop your audio file to upload" : "Upload Audio File"}
      </h2>
      <form
        action="?/create"
        method="POST"
        class="space-y-6"
        onsubmit={() => {
          isCreating = true;
        }}
      >
        <input type="hidden" name="project_id" value={data.project.id} />

        <!-- Drag & Drop Area -->
        <div
          class="border-2 border-dashed ${isDragging
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-gray-600'} rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer"
          role="button"
          tabindex="0"
          onclick={() => document.getElementById("audio-file")?.click()}
        >
          <input
            type="file"
            id="audio-file"
            name="audio"
            accept="audio/*"
            class="hidden"
            onchange={handleFileSelect}
          />
          <div class="text-gray-400 mb-4">
            {selectedFile ? selectedFile.name : "Select file or drag and drop"}
          </div>
          <button
            type="button"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            {selectedFile ? "Change File" : "Choose File"}
          </button>
        </div>

        <!-- Optional Name Input -->
        <div>
          <label
            for="song-name"
            class="block text-sm font-medium text-gray-300 mb-1"
            >Name (optional)</label
          >
          <input
            id="song-name"
            type="text"
            name="name"
            bind:value={newSongName}
            placeholder="Enter song name"
            class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isCreating}
          >
            {#if isCreating}
              <Loader2 class="animate-spin" size={20} />
            {:else}
              Upload
            {/if}
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onclick={closeCreateModal}
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
