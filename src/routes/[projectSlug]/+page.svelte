<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import DeleteProjectModal from "$lib/components/projects/DeleteProjectModal.svelte";
  import LeaveProjectModal from "$lib/components/projects/LeaveProjectModal.svelte";
  import ProjectInviteModal from "$lib/components/projects/ProjectInviteModal.svelte";
  import ProjectMembersModal from "$lib/components/projects/ProjectMembersModal.svelte";
  import DeleteTrackModal from "$lib/components/tracks/DeleteTrackModal.svelte";
  import NoTracksView from "$lib/components/tracks/NoTracksView.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PopupMenu from "$lib/components/ui/popup/PopupMenu.svelte";
  import PopupMenuOption from "$lib/components/ui/popup/PopupMenuOption.svelte";
  import type { Track } from "$lib/types/track";
  import { DataTable } from "@careswitch/svelte-data-table";
  import {
    FileMusic,
    ListMusic,
    Loader2,
    LogOut,
    Plus,
    Settings,
    Share2,
    Trash2,
    Users,
  } from "lucide-svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";
  import type { PageProps } from "./$types";

  let isDeleting = $state(false);
  let trackToDelete: Track | null = $state(null);
  let isDeleteTrackModalOpen = $state(false);
  let songName = $state("");
  let selectedFile = $state<File | null>(null);
  let isDragging = $state(false);
  let isUploading = $state(false);
  let isLeaveModalOpen = $state(false);
  let isDeleteProjectModalOpen = $state(false);
  let isUsersModalOpen = $state(false);

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

  // Inicjalizacja DataTable dla listy utworów
  const table = new DataTable({
    data: data.tracks,
    columns: [
      { id: "icon", key: "id", name: "", sortable: false },
      { id: "name", key: "name", name: "Nazwa utworu", sortable: true },
      { id: "date", key: "created_at", name: "Data dodania", sortable: true },
      { id: "actions", key: "id", name: "Akcje", sortable: false },
    ],
    initialSortDirection: "desc",
    initialSort: "date",
  });

  let isCreateModalOpen = $state(false);
  let isInviteModalOpen = $state(false);

  function openDeleteProjectModal() {
    isDeleteProjectModalOpen = true;
  }

  function closeDeleteProjectModal() {
    isDeleteProjectModalOpen = false;
  }

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

  <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
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
        onclick={openDeleteProjectModal}
      />
    </PopupMenu>

    {#if data.tracks.length !== 0}
      <button
        onclick={openCreateModal}
        class="w-full h-10 sm:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Nowy utwór
      </button>
    {/if}
  </div>
</div>

<div class="flex flex-col lg:flex-row my-4 gap-6">
  {#if data.tracks.length === 0}
    <NoTracksView onAddTrack={openCreateModal} />
  {:else}
    <div class="w-full">
      <!-- Panel wyszukiwania -->
      <div class="flex justify-end mb-4">
        <div class="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Wyszukaj utwory..."
            class="w-full px-3 py-2 bg-gray-800/70 border border-gray-700/50 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            bind:value={table.globalFilter}
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
      <!-- class="w-full bg-gray-800/70 rounded-lg overflow-hidden border border-gray-700/50" -->
      <div class="w-full bg-gray-800/70 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <!-- class="bg-gray-800 text-gray-300 px-4 py-4 text-left font-medium border-b border-gray-700 w-[50px]" -->
              <th
                class="bg-gray-800 text-gray-300 px-4 py-4 text-left font-medium w-[50px]"
              ></th>
              <th
                class="bg-gray-800 text-gray-300 px-4 py-4 text-left font-medium"
              >
                <button
                  class="flex items-center"
                  onclick={() => table.toggleSort("name")}
                  disabled={!table.isSortable("name")}
                >
                  Nazwa utworu
                  {#if table.isSortable("name")}
                    <span class="ml-2 text-blue-400">
                      {#if table.getSortState("name") === "asc"}
                        ↑
                      {:else if table.getSortState("name") === "desc"}
                        ↓
                      {:else}
                        ↕
                      {/if}
                    </span>
                  {/if}
                </button>
              </th>
              <th
                class="bg-gray-800 text-gray-300 px-4 py-4 text-left font-medium"
              >
                <button
                  class="flex items-center"
                  onclick={() => table.toggleSort("date")}
                  disabled={!table.isSortable("date")}
                >
                  Data dodania
                  {#if table.isSortable("date")}
                    <span class="ml-2 text-blue-400">
                      {#if table.getSortState("date") === "asc"}
                        ↑
                      {:else if table.getSortState("date") === "desc"}
                        ↓
                      {:else}
                        ↕
                      {/if}
                    </span>
                  {/if}
                </button>
              </th>
              <th
                class="bg-gray-800 text-gray-300 px-4 py-4 text-right font-medium"
                >Akcje</th
              >
            </tr>
          </thead>
          <tbody>
            {#if data.tracks.length === 0}
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                  <div
                    class="flex flex-col items-center justify-center space-y-2"
                  >
                    <ListMusic size={40} class="text-gray-600" />
                    <p>Brak utworów w tym projekcie</p>
                  </div>
                </td>
              </tr>
            {:else if table.rows.length === 0}
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                  <div
                    class="flex flex-col items-center justify-center space-y-2"
                  >
                    <ListMusic size={40} class="text-gray-600" />
                    <p>Nie znaleziono utworów pasujących do wyszukiwania</p>
                    <button
                      class="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                      onclick={() => (table.globalFilter = "")}
                    >
                      Wyczyść filtr
                    </button>
                  </div>
                </td>
              </tr>
            {:else}
              {#each table.rows as row (row.id)}
                {@const track = row}
                {@const trackSlug = "slug" in track ? track.slug : ""}
                <tr
                  class="hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onclick={() => goto(`/${data.project.slug}/${trackSlug}`)}
                  onkeydown={(e) =>
                    e.key === "Enter" &&
                    goto(`/${data.project.slug}/${trackSlug}`)}
                  tabindex="0"
                >
                  <td class="px-4 py-4">
                    <FileMusic size={20} class="text-blue-400" />
                  </td>
                  <td class="px-4 py-4 font-medium">
                    {"name" in track ? track.name : "-"}
                  </td>
                  <td class="px-4 py-4 text-gray-400">
                    {"created_at" in track ? formatDate(track.created_at) : ""}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
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
                  </td>
                </tr>
                {#if row !== table.rows[table.rows.length - 1]}
                  <tr>
                    <td colspan="4">
                      <div class="border-b border-gray-700"></div>
                    </td>
                  </tr>
                {/if}
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
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

<ProjectInviteModal {project} bind:isOpen={isInviteModalOpen} />
<ProjectMembersModal bind:isOpen={isUsersModalOpen} {projectUsers} />
<LeaveProjectModal {project} bind:isOpen={isLeaveModalOpen} />
<DeleteProjectModal {project} bind:isOpen={isDeleteProjectModalOpen} />
<DeleteTrackModal
  track={trackToDelete}
  bind:isOpen={isDeleteTrackModalOpen}
  onClose={() => {
    trackToDelete = null;
    isDeleteTrackModalOpen = false;
  }}
/>
