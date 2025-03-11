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
  import toast from "svelte-french-toast";
  import type { PageProps } from "./$types";

  let isLoading = $state(false);
  let isCreating = $state(false);
  let isDeleting = $state(false);
  let trackToDelete: (typeof data.tracks)[0] | null = $state(null);
  let newSongName = $state("");
  let selectedFile = $state<File | null>(null);
  let isDragging = $state(false);
  let fileError = $state("");
  let uploadProgress = $state(0);
  let uploadPhase = $state("idle"); // idle, preparing, uploading, complete, error
  let isUploading = $state(false);
  let uploadStartTime = $state<number | null>(null);
  let uploadSpeed = $state(0); // w KB/s
  let uploadTimeLeft = $state(""); // estymowany czas do końca uploadu

  function handleFileSelect(event: Event) {
    fileError = "";
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith("audio/")) {
        selectedFile = file;
        newSongName = file.name.replace(/\.[^/.]+$/, "");
      } else {
        fileError = "Please upload an audio file (MP3, WAV, etc.)";
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
        newSongName = file.name.replace(/\.[^/.]+$/, "");

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
        fileError = "Please upload an audio file (MP3, WAV, etc.)";
      }
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

  const { data }: PageProps = $props();

  let searchQuery = $state("");
  let isCreateModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    if (!isUploading) {
      isCreateModalOpen = false;
      newSongName = "";
      selectedFile = null;
      fileError = "";
      uploadProgress = 0;
      uploadPhase = "idle";
      uploadSpeed = 0;
      uploadTimeLeft = "";
      uploadStartTime = null;
    }
  }

  async function handleFileUpload(e: Event) {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    isUploading = true;
    uploadProgress = 0;
    uploadPhase = "preparing";
    fileError = "";
    uploadSpeed = 0;
    uploadTimeLeft = "";
    uploadStartTime = null;
    
    try {
      // Przygotuj dane formularza
      const form = document.querySelector('form[action="?/create"]') as HTMLFormElement;
      const formData = new FormData(form);
      
      // Dodaj wskaźnik dla monitorowania postępu
      const xhr = new XMLHttpRequest();
      
      // Ustaw początek uploadowania (xhr.send jeszcze nie zaczęło wysyłać danych)
      xhr.upload.addEventListener('loadstart', () => {
        uploadPhase = "uploading";
        uploadStartTime = Date.now();
      });
      
      // Ustaw obsługę monitorowania postępu
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Pełny procent postępu uploadu pliku
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          uploadProgress = percentComplete;
          
          // Obliczanie prędkości uploadu i estymowanego czasu do końca
          if (uploadStartTime) {
            const elapsedTimeMs = Date.now() - uploadStartTime;
            const elapsedTimeSec = elapsedTimeMs / 1000;
            
            if (elapsedTimeSec > 0) {
              // Prędkość w KB/s
              uploadSpeed = Math.round((event.loaded / 1024) / elapsedTimeSec);
              
              // Estymowany czas do końca
              if (event.loaded > 0) {
                const totalTimeEstimate = (event.total / event.loaded) * elapsedTimeSec;
                const remainingTimeEstimate = totalTimeEstimate - elapsedTimeSec;
                
                if (remainingTimeEstimate < 60) {
                  uploadTimeLeft = `${Math.round(remainingTimeEstimate)} sek.`;
                } else {
                  uploadTimeLeft = `${Math.round(remainingTimeEstimate / 60)} min.`;
                }
              }
            }
          }
        }
      });
      
      // Gdy plik zostanie w pełni przesłany
      xhr.upload.addEventListener('load', () => {
        // Nic nie robimy, cały postęp jest pokazywany jako 100%
        uploadProgress = 100;
      });
      
      // Ustaw obsługę zakończenia całego procesu (upload + przetwarzanie na serwerze)
      xhr.addEventListener('loadend', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Sprawdź, czy nie ma błędu w odpowiedzi, nawet jeśli kod statusu to 200
          try {
            const response = JSON.parse(xhr.responseText);
            
            // Jeśli odpowiedź zawiera pole 'error' lub informację o błędzie, traktuj to jako błąd
            if (response && (response.error || (response.message && xhr.status !== 200))) {
              isUploading = false;
              
              // Pobranie czytelnego tekstu błędu
              let errorText;
              
              if (response.error) {
                errorText = typeof response.error === 'object' 
                  ? (response.error.message || JSON.stringify(response.error)) 
                  : String(response.error);
              } else if (response.message) {
                errorText = typeof response.message === 'object' 
                  ? (response.message.message || JSON.stringify(response.message)) 
                  : String(response.message);
              } else {
                errorText = "Wystąpił błąd podczas przesyłania pliku";
              }
              
              fileError = errorText;
              uploadPhase = "error";
              toast.error(errorText, { position: 'top-right', duration: 5000 });
              return;
            }
          } catch (e) {
            // Ignorujemy błąd parsowania JSON, jeśli status to 200-299, bo może to być przekierowanie
          }
          
          uploadPhase = "complete";
          // Przekierowanie nastąpi automatycznie przez odpowiedź serwera
        } else {
          isUploading = false;
          uploadPhase = "error";
          
          // Próba wydobycia szczegółowej informacji o błędzie z odpowiedzi
          try {
            const response = JSON.parse(xhr.responseText);
            // SvelteKit zwraca błędy w polu message
            if (response && response.message) {
              // Obsługa przypadku, gdy message jest obiektem
              const messageText = typeof response.message === 'object' 
                ? (response.message.message || JSON.stringify(response.message)) 
                : String(response.message);
                
              fileError = messageText;
              toast.error(messageText, { position: 'top-right', duration: 5000 });
            } else if (response && response.error) {
              // Obsługa przypadku, gdy error jest obiektem
              const errorText = typeof response.error === 'object' 
                ? (response.error.message || JSON.stringify(response.error)) 
                : String(response.error);
                
              fileError = errorText;
              toast.error(errorText, { position: 'top-right', duration: 5000 });
            } else {
              const errorMsg = "Wystąpił błąd podczas przesyłania pliku (status " + xhr.status + ")";
              fileError = errorMsg;
              toast.error(errorMsg, { position: 'top-right', duration: 5000 });
            }
          } catch (e) {
            const errorMsg = "Wystąpił błąd podczas przesyłania pliku (status " + xhr.status + ")";
            fileError = errorMsg;
            toast.error(errorMsg, { position: 'top-right', duration: 5000 });
          }
        }
      });
      
      // Ustaw obsługę błędów
      xhr.addEventListener('error', () => {
        isUploading = false;
        uploadPhase = "error";
        const errorMsg = "Wystąpił błąd podczas przesyłania pliku";
        fileError = errorMsg;
        toast.error(errorMsg, { position: 'top-right', duration: 5000 });
      });
      
      // Otwórz połączenie i wyślij formularz
      xhr.open('POST', `?/create`);
      xhr.send(formData);
    } catch (error) {
      isUploading = false;
      uploadPhase = "error";
      const errorMsg = "Wystąpił nieoczekiwany błąd";
      fileError = errorMsg;
      toast.error(errorMsg, { position: 'top-right', duration: 5000 });
      console.error("Błąd uploadu:", error);
    }
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
          <!-- Sprawdzamy typ track przed użyciem jego właściwości -->
          {@const trackSlug = 'slug' in track ? track.slug : ''}
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
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Music2 size={20} class="text-blue-400" />
                  <h2 class="font-semibold text-lg">{"name" in track ? track.name : "Untitled"}</h2>
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
                  {"created_at" in track ? formatDate(track.created_at) : ""}
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
    role="presentation"
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
        enctype="multipart/form-data"
        onsubmit={(e) => {
          if (selectedFile) {
            e.preventDefault();
            handleFileUpload(e);
          } else {
            isCreating = true;
          }
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
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("audio-file")?.click();
            }
          }}
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
            {#if fileError}
              <p class="text-red-400 mb-2">{fileError}</p>
            {/if}
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

        <!-- Stan uploadu (pokazywany podczas całego procesu) -->
        {#if isUploading}
          <div class="space-y-2">
            {#if uploadPhase === "preparing"}
              <!-- Faza przygotowania - krećący się spinner -->
              <div class="flex flex-col items-center justify-center py-2">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
                <span class="text-sm text-gray-400">Przygotowywanie uploadu...</span>
                <p class="text-xs text-gray-500 mt-1">Przygotowanie do przesyłania pliku...</p>
              </div>
            {:else if uploadPhase === "uploading"}
              <!-- Faza uploadu pliku - pasek posteępu z dokładnymi informacjami -->
              <div class="flex justify-between text-sm text-gray-400">
                <span>Przesyłanie pliku...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  class="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style="width: {uploadProgress}%"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500">
                <span>Prędkość: {uploadSpeed >= 1024 ? `${(uploadSpeed / 1024).toFixed(1)} MB/s` : `${uploadSpeed} KB/s`}</span>
                {#if uploadTimeLeft}
                  <span>Pozostało: {uploadTimeLeft}</span>
                {/if}
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Przesyłanie pliku {selectedFile?.name} na serwer...
                <span class="block mt-1 text-xs italic">Po zakończeniu plik zostanie przesłany do Supabase Storage</span>
              </p>
            {:else if uploadPhase === "error"}
              <!-- Faza błędu -->
              <div class="text-sm text-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>Wystąpił błąd podczas przesyłania pliku</span>
              </div>
              <p class="text-xs text-red-400 mt-1">{fileError}</p>
            {/if}
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isCreating || isUploading || !selectedFile}
          >
            {#if isCreating}
              <Loader2 class="animate-spin" size={20} />
            {:else if isUploading}
              Uploading...
            {:else}
              Upload
            {/if}
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onclick={closeCreateModal}
            disabled={isUploading}
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
