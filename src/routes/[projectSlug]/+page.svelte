<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import {
    Calendar,
    ListMusic,
    Loader2,
    Music2,
    Plus,
    Trash2,
  } from "lucide-svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";
  import type { PageProps } from "./$types";

  let isDeleting = $state(false);
  let trackToDelete: (typeof data.tracks)[0] | null = $state(null);
  let songName = $state("");
  let selectedFile = $state<File | null>(null);
  let isDragging = $state(false);
  let isUploading = $state(false);

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith("audio/")) {
        selectedFile = file;
        songName = file.name.split(".").slice(0, -1).join(".");
        console.log("songName:", songName);
      } else {
        toast.error("Wybierz plik audio (MP3, WAV, itp.)", {
          position: "bottom-right",
        });
        input.value = "";
      }
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
        songName = file.name.split(".").slice(0, -1).join(".");

        // Update the hidden file input to reflect the dropped file
        const fileInput = document.getElementById(
          "audio-file"
        ) as HTMLInputElement;
        if (fileInput) {
          // Create a new DataTransfer object and add our file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
        }
      } else {
        toast.error("Wybierz plik audio (MP3, WAV, itp.)", {
          position: "bottom-right",
        });
      }
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pl", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const { data }: PageProps = $props();
  const supabase = data.supabase;
  const project = data.project;

  let isCreateModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    if (!isUploading) {
      isCreateModalOpen = false;
      songName = "";
      selectedFile = null;
    }
  }
</script>

<Toaster />

<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <Breadcrumbs project={data.project} />
  {#if data.tracks.length !== 0}
    <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
      <button
        onclick={openCreateModal}
        class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Nowy utwór
      </button>
    </div>
  {/if}
</div>

<div class="flex flex-col lg:flex-row my-4 gap-6">
  {#if data.tracks.length === 0}
    <div
      class="w-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-6"
      transition:fade
    >
      <div class="text-gray-600">
        <ListMusic size={100}></ListMusic>
      </div>
      <div class="space-y-2 text-center px-4">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-200">
          Brak utworów
        </h3>
        <p class="text-gray-400">Dodaj utwór do swojego projektu</p>
      </div>
      <button
        onclick={openCreateModal}
        class="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
      >
        <Plus size={20} />
        Dodaj utwór
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {#each data.tracks as track (track.id)}
        <!-- Sprawdzamy typ track przed użyciem jego właściwości -->
        {@const trackSlug = "slug" in track ? track.slug : ""}
        <div
          class="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-700/70 transition-all transform hover:-translate-y-0.5 border border-gray-700/50 gap-4"
          transition:slide
          role="button"
          tabindex="0"
          onclick={() => goto(`/${data.project.slug}/${trackSlug}`)}
          onkeydown={(e) =>
            e.key === "Enter" && goto(`/${data.project.slug}/${trackSlug}`)}
        >
          <div class="flex-1 w-full">
            <div class="flex items-center gap-4 justify-between mb-2">
              <div class="flex items-center gap-2">
                <Music2 size={20} class="text-blue-400" />
                <h2 class="font-semibold text-lg">
                  {"name" in track ? track.name : "-"}
                </h2>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-600/50"
                onclick={(e) => {
                  e.stopPropagation();
                  trackToDelete = track;
                }}
                title="Usuń utwór"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div
              class="flex flex-wrap items-center gap-4 text-sm text-gray-400"
            >
              <!-- <div class="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(123)}
              </div>
              <div class="flex items-center gap-1">
                <Users size={14} />
                Stachu Jones
              </div> -->
              <div class="flex items-center gap-1">
                <Calendar size={14} />
                {"created_at" in track ? formatDate(track.created_at) : ""}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if isCreateModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade={{ duration: 300 }}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="presentation"
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md ${isDragging
        ? 'border-2 border-blue-400 bg-blue-950'
        : ''}"
      transition:slide={{ duration: 300 }}
    >
      {#if isUploading}
        <!-- Stan uploadu (pokazywany podczas całego procesu) -->
        <div class="space-y-2">
          <!-- Faza przygotowania - krećący się spinner -->
          <div class="flex flex-col items-center justify-center py-2">
            <Loader2 class="animate-spin" size={30} />
            <span class="text-sm text-gray-400">Trwa przesyłanie pliku...</span>
            <p class="text-xs text-gray-500 mt-1">
              Prosimy nie odświeżać strony
            </p>
          </div>
        </div>
      {:else}
        <h2 class="text-xl font-bold mb-6">
          {isDragging ? "Przeciągnij plik audio aby dodać" : "Dodaj plik audio"}
        </h2>
        <input
          type="file"
          id="audio-file"
          name="file"
          accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mp3,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/flac"
          class="hidden"
          onchange={handleFileSelect}
        />
        <form
          action="?/create"
          method="POST"
          class="space-y-6"
          use:enhance={async ({ formElement, formData }) => {
            isUploading = true;
            const file = selectedFile;
            if (!file) {
              isUploading = false;
              songName = "";
              selectedFile = null;
              formElement.reset();
              toast.error("No file selected", { position: "bottom-right" });
              return;
            }
            // Sanitize the file name for storage
            const storageFileName = file.name
              .replace(/\.[^.]+$/, "") // Remove file extension
              .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsupported chars with underscore
              .replace(/\s+/g, "-") // Replace spaces with underscore
              .toLowerCase(); // Convert to lowercase for consistency

            const timestamp = new Date().toISOString().replace(/[:.]/g, "");

            // 1. zapisanie pliku do storage
            const storagePath = `${project.slug}/${storageFileName}_${timestamp}`;
            const { error: storageError } = await supabase.storage
              .from("project_files")
              .upload(storagePath, file, {
                contentType: file.type,
              });

            formData.append("storage_file_path", storagePath);

            if (storageError) {
              console.error(
                `Error uploading file in +page.svelte [${project.slug}]:`,
                storageError
              );
              isUploading = false;
              songName = "";
              selectedFile = null;
              formElement.reset();
              toast.error(storageError.message, { position: "bottom-right" });
              return;
            }
            return async ({ result }) => {
              console.log("result:", result);

              if (result.type === "error") {
                await supabase.storage
                  .from("project_files")
                  .remove([storagePath]);

                isUploading = false;
                songName = "";
                selectedFile = null;
                formElement.reset();
                toast.error(result.error.message, { position: "bottom-right" });
              } else if (result.type === "redirect") {
                goto(result.location);
              }
            };
          }}
        >
          <input type="hidden" name="project_id" value={data.project.id} />
          <input type="hidden" name="file_name" value={selectedFile?.name} />

          <!-- Drag & Drop Area -->
          <div
            class="border-2 border-dashed ${isDragging
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600'} rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors"
          >
            <div class="text-gray-400 mb-4">
              {selectedFile
                ? selectedFile.name
                : "Kliknij poniższy przycisk lub przeciągnij plik"}
            </div>
            <button
              type="button"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              onclick={() => document.getElementById("audio-file")?.click()}
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document.getElementById("audio-file")?.click();
                }
              }}
            >
              <Plus size={16} />
              {selectedFile ? "Zmień plik" : "Wybierz plik"}
            </button>
          </div>

          <!-- Optional Name Input -->
          <div>
            <label
              for="song-name"
              class="block text-sm font-medium text-gray-300 mb-1"
              >Nazwa utworu</label
            >
            <input
              id="song-name"
              type="text"
              name="name"
              bind:value={songName}
              class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!selectedFile}
            >
              Dodaj
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              onclick={closeCreateModal}
            >
              Anuluj
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if trackToDelete}
  <form
    action="?/delete"
    method="POST"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade
    onsubmit={() => {
      isDeleting = true;
    }}
  >
    <input type="hidden" name="id" value={trackToDelete.id} />
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700/50"
      transition:slide
    >
      <h2 class="text-xl font-bold mb-4">Usuń utwór</h2>
      <p class="text-gray-300 mb-6">
        Czy na pewno chcesz usunąć "{trackToDelete.name}". Tej czynności nie
        można cofnąć.
      </p>
      <div class="flex space-x-4">
        <button
          class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDeleting}
        >
          {#if isDeleting}
            <Loader2 class="animate-spin mx-auto" size={20} />
          {:else}
            Usuń
          {/if}
        </button>
        <button
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onclick={() => (trackToDelete = null)}
        >
          Anuluj
        </button>
      </div>
    </div>
  </form>
{/if}
