<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import {
    Calendar,
    Link2,
    ListMusic,
    Loader2,
    Music2,
    Plus,
    Share2,
    Trash2,
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import toast, { Toaster } from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";
  import type { PageProps } from "./$types";

  let isDeleting = $state(false);
  let isLeavingProject = $state(false);
  let trackToDelete: (typeof data.tracks)[0] | null = $state(null);
  let songName = $state("");
  let selectedFile = $state<File | null>(null);
  let isDragging = $state(false);
  let isUploading = $state(false);
  let isLeaveModalOpen = $state(false);
  let isProjectMenuOpen = $state(false);
  let isDeleteProjectModalOpen = $state(false);
  let isDeletingProject = $state(false);
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const { data }: PageProps = $props();
  const supabase = data.supabase;
  const project = data.project;
  const projectUsers = data.projectUsers;

  let isCreateModalOpen = $state(false);
  let isInviteModalOpen = $state(false);
  let inviteUrl = $state("");
  let isCopied = $state(false);

  function openLeaveModal() {
    isLeaveModalOpen = true;
    isProjectMenuOpen = false;
  }

  function closeLeaveModal() {
    isLeaveModalOpen = false;
  }

  function openDeleteProjectModal() {
    isDeleteProjectModalOpen = true;
    closeProjectMenu();
  }

  function closeDeleteProjectModal() {
    isDeleteProjectModalOpen = false;
  }

  function openUsersModal() {
    isUsersModalOpen = true;
    closeProjectMenu();
  }

  function closeUsersModal() {
    isUsersModalOpen = false;
  }

  function toggleProjectMenu(event: Event) {
    event.stopPropagation();
    isProjectMenuOpen = !isProjectMenuOpen;
  }

  function closeProjectMenu() {
    isProjectMenuOpen = false;
  }

  // Obsługa kliknięcia poza menu aby je zamknąć
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProjectMenuOpen) {
        const target = event.target as HTMLElement;
        const menuContainer = document.getElementById("project-menu-container");

        if (menuContainer && !menuContainer.contains(target)) {
          isProjectMenuOpen = false;
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  async function leaveProject() {
    try {
      isLeavingProject = true;

      const response = await fetch("/api/project-invites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: data.project.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Błąd podczas opuszczania projektu"
        );
      }

      const responseData = await response.json();

      // Wyświetl komunikat o powodzeniu
      toast.success(responseData.message || "Pomyślnie opuszczono projekt", {
        position: "bottom-right",
        duration: 3000,
      });

      // Przekieruj do strony głównej po opuszczeniu projektu
      goto("/");
    } catch (error) {
      console.error("Error leaving project:", error);

      // Wyświetl komunikat o błędzie
      toast.error(
        error instanceof Error
          ? error.message
          : "Nie udało się opuścić projektu",
        {
          position: "bottom-right",
          duration: 5000,
        }
      );

      isLeavingProject = false;
      closeLeaveModal();
    }
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

  function openInviteModal() {
    isInviteModalOpen = true;
    // Jeśli nie ma jeszcze wygenerowanego linku, generujemy go automatycznie
    if (!inviteUrl) {
      generateInviteLink();
    }
  }

  function closeInviteModal() {
    isInviteModalOpen = false;
    isCopied = false;
  }

  async function generateInviteLink() {
    try {
      inviteUrl = "";
      const response = await fetch("/api/project-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: data.project.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Błąd podczas generowania linku");
      }

      const inviteData = await response.json();
      inviteUrl = inviteData.invite_url;
      isCopied = false;
    } catch (error) {
      console.error("Error generating invite link:", error);
      toast.error("Nie udało się wygenerować linku zapraszającego", {
        position: "bottom-right",
      });
    }
  }

  function copyInviteLink() {
    if (inviteUrl) {
      navigator.clipboard
        .writeText(inviteUrl)
        .then(() => {
          isCopied = true;
          toast.success("Link skopiowany do schowka", {
            position: "bottom-right",
            duration: 3000,
          });

          // Reset stanu po 3 sekundach
          setTimeout(() => {
            isCopied = false;
          }, 3000);
        })
        .catch(() => {
          toast.error("Nie udało się skopiować linku", {
            position: "bottom-right",
          });
        });
    }
  }
</script>

<Toaster />

<div
  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
>
  <Breadcrumbs project={data.project} />

  <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
    <button
      onclick={openInviteModal}
      class="w-full h-10 sm:w-auto bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <Share2 size={20} />
      Zaproś do projektu
    </button>
    <div class="relative" id="project-menu-container">
      <button
        onclick={toggleProjectMenu}
        class="w-full h-10 sm:w-auto bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          ></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Zarządzaj
      </button>

      {#if isProjectMenuOpen}
        <div
          class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 z-50"
          transition:fade={{ duration: 150 }}
        >
          <div class="py-1" role="none">
            <button
              onclick={openUsersModal}
              class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Członkowie projektu
            </button>
            <button
              onclick={openLeaveModal}
              class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Opuść projekt
            </button>
            <button
              onclick={openDeleteProjectModal}
              class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 flex items-center gap-2"
              role="menuitem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Usuń projekt
            </button>
          </div>
        </div>
      {/if}
    </div>
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

{#if isInviteModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
    transition:fade={{ duration: 300 }}
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-xl"
      role="dialog"
      aria-labelledby="invite-modal-title"
      aria-modal="true"
      tabindex="-1"
      transition:slide={{ duration: 300 }}
    >
      <h2 id="invite-modal-title" class="text-xl font-bold mb-6">
        Zaproś do projektu
      </h2>

      <div class="space-y-4 mb-6">
        <p class="text-gray-300">
          Skopiuj link zapraszający i udostępnij go osobom, które chcesz
          zaprosić do współpracy przy projekcie <span class="font-semibold"
            >{project.name}</span
          >.
        </p>

        <div class="bg-gray-700 p-3 rounded-lg flex items-center">
          <input
            type="text"
            readonly
            class="bg-transparent flex-1 outline-none text-sm"
            value={inviteUrl}
          />
          <button
            class="ml-2 p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="Kopiuj link"
            disabled={!inviteUrl}
            onclick={copyInviteLink}
            aria-label="Kopiuj link zapraszający"
          >
            {#if !inviteUrl}
              <Loader2 class="animate-spin text-blue-400" size={18} />
            {:else if isCopied}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-green-400"
                ><polyline points="20 6 9 17 4 12"></polyline></svg
              >
            {:else}
              <Link2 size={18} />
            {/if}
          </button>
        </div>
        <div class="flex items-center justify-center text-sm mt-4">
          <span class="text-gray-400">Problem z linkiem?</span>
          <button
            onclick={generateInviteLink}
            class="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Wygeneruj nowy
          </button>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          onclick={closeInviteModal}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Powrót
        </button>
      </div>
    </div>
  </div>
{/if}

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

<!-- Leave Project Confirmation Modal -->
{#if isLeaveModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
    transition:fade
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700/50"
      transition:slide
    >
      <h2 class="text-xl font-bold mb-4">Opuść projekt</h2>
      <p class="text-gray-300 mb-6">
        Czy na pewno chcesz opuścić projekt
        <span class="font-semibold">{project.name}</span>?
      </p>
      <div class="flex space-x-4">
        <button
          class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={leaveProject}
          disabled={isLeavingProject}
        >
          {#if isLeavingProject}
            <Loader2 class="animate-spin mx-auto" size={20} />
          {:else}
            Opuść projekt
          {/if}
        </button>
        <button
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onclick={closeLeaveModal}
          disabled={isLeavingProject}
        >
          Anuluj
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Project Confirmation Modal -->
{#if isDeleteProjectModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
    transition:fade={{ duration: 300 }}
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700/50"
      transition:slide={{ duration: 300 }}
    >
      <h2 class="text-xl font-bold mb-4">Usuń projekt</h2>
      <p class="text-gray-300 mb-6">
        Czy na pewno chcesz usunąć projekt
        <span class="font-semibold">{data.project.name}</span>? Tej czynności
        nie można cofnąć. Wszystkie pliki projektu i dane zostaną trwale
        usunięte.
      </p>
      <form
        action="?/deleteProject"
        method="POST"
        class="flex space-x-4"
        use:enhance={() => {
          isDeletingProject = true;
          return async ({ result, update }) => {
            if (result.type === "error") {
              toast.error(
                result.error?.message ||
                  "Wystąpił błąd podczas usuwania projektu",
                {
                  position: "bottom-right",
                }
              );
              isDeletingProject = false;
              closeDeleteProjectModal();
            }

            update();
          };
        }}
      >
        <input type="hidden" name="id" value={data.project.id} />
        <input type="hidden" name="slug" value={data.project.slug} />
        <button
          type="submit"
          class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isDeletingProject}
        >
          {#if isDeletingProject}
            <Loader2 class="animate-spin" size={20} />
          {:else}
            Usuń projekt
          {/if}
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          onclick={closeDeleteProjectModal}
        >
          Anuluj
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Project Users Modal -->
{#if isUsersModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
    transition:fade={{ duration: 300 }}
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md" transition:slide>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Członkowie projektu</h2>
        <button
          onclick={closeUsersModal}
          class="text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="Zamknij modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
        {#if projectUsers && projectUsers.length > 0}
          <ul class="space-y-3">
            {#each projectUsers as projectUser}
              <li
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div
                  class="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
                >
                  {#if projectUser.user.avatar_url}
                    <img
                      src={projectUser.user.avatar_url}
                      alt={projectUser.user.name || projectUser.user.email}
                      class="h-full w-full object-cover"
                      aria-label="Obrazek użytkownika"
                    />
                  {:else}
                    {(projectUser.user.name ||
                      projectUser.user.email ||
                      "?")[0].toUpperCase()}
                  {/if}
                </div>
                <div class="overflow-hidden">
                  <div class="font-medium truncate">
                    {projectUser.user.name || "Bez nazwy"}
                  </div>
                  <div class="text-sm text-gray-400 truncate">
                    {projectUser.user.email}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="text-center text-gray-400 py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mx-auto mb-4"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>Brak użytkowników w projekcie</p>
          </div>
        {/if}
      </div>

      <div class="mt-6 flex justify-center">
        <button
          onclick={closeUsersModal}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          aria-label="Zamknij modal użytkowników"
        >
          Powrót
        </button>
      </div>
    </div>
  </div>
{/if}
