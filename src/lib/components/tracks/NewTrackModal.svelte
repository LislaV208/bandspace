<script lang="ts">
  import { goto } from "$app/navigation";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import { getSupabaseContext } from "$lib/supabase-context";
  import type { Project } from "$lib/types/project";
  import type { Track } from "$lib/types/track";
  import type { TrackCategory } from "$lib/types/track_category";
  import type { TrackFileCreate } from "$lib/types/track_file";
  import {
    FileMusic,
    Info,
    Loader2,
    Music,
    Tag,
    Upload,
    User,
  } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import Button from "../ui/Button.svelte";
  import Input from "../ui/Input.svelte";

  let {
    isOpen = $bindable(),
    project,
    categories,
  }: {
    isOpen: boolean;
    project: Project;
    categories: TrackCategory[];
  } = $props();

  let selectedFile = $state<File | null>(null);
  let songName = $state("");
  let category = $state(categories[0]);
  let description = $state("");
  let isUploading = $state(false);
  let currentStep = $state(1); // 1: wybór pliku, 2: szczegóły utworu
  let dragActive = $state(false);
  let globalDragCounter = $state(0);

  const supabase = getSupabaseContext();

  // Obsługa globalnego przeciągania plików
  function handleGlobalDragEnter(e: DragEvent) {
    e.preventDefault();
    globalDragCounter++;
    if (isOpen) {
      dragActive = true;
    }
  }

  function handleGlobalDragLeave(e: DragEvent) {
    e.preventDefault();
    globalDragCounter--;
    if (globalDragCounter <= 0) {
      globalDragCounter = 0;
      dragActive = false;
    }
  }

  function handleGlobalDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleGlobalDrop(e: DragEvent) {
    e.preventDefault();
    globalDragCounter = 0;
    dragActive = false;

    // Obsługuj upuszczenie, jeśli modal jest otwarty (niezależnie od kroku)
    if (isOpen && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB

      if (!file.type.startsWith("audio/")) {
        toast.error("Wybierz plik audio (MP3, WAV, itp.)");
        return;
      }

      if (file.size > maxSizeInBytes) {
        toast.error("Plik jest zbyt duży. Maksymalny rozmiar to 50 MB");
        return;
      }

      selectedFile = file;
      songName = file.name.split(".").slice(0, -1).join(".");
      currentStep = 2; // Zawsze przechodzimy do drugiego kroku
    }
  }

  // Dodajemy i usuwamy globalne listenery
  onMount(() => {
    // Sprawdzamy, czy kod jest wykonywany w środowisku przeglądarki
    if (typeof window !== "undefined") {
      window.addEventListener("dragenter", handleGlobalDragEnter);
      window.addEventListener("dragleave", handleGlobalDragLeave);
      window.addEventListener("dragover", handleGlobalDragOver);
      window.addEventListener("drop", handleGlobalDrop);
    }
  });

  onDestroy(() => {
    // Sprawdzamy, czy kod jest wykonywany w środowisku przeglądarki
    if (typeof window !== "undefined") {
      window.removeEventListener("dragenter", handleGlobalDragEnter);
      window.removeEventListener("dragleave", handleGlobalDragLeave);
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("drop", handleGlobalDrop);
    }
  });

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB

      if (!file.type.startsWith("audio/")) {
        toast.error("Wybierz plik audio (MP3, WAV, itp.)");
        input.value = "";
        return;
      }

      if (file.size > maxSizeInBytes) {
        toast.error("Plik jest zbyt duży. Maksymalny rozmiar to 50 MB");
        input.value = "";
        return;
      }

      selectedFile = file;
      songName = file.name.split(".").slice(0, -1).join(".");
      currentStep = 2;
    }
  }

  function openFilePicker() {
    document.getElementById("audio-file")?.click();
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // Resetowanie stanu przy zamknięciu modalu
  $effect(() => {
    if (!isOpen) {
      setTimeout(() => {
        if (!isOpen) {
          selectedFile = null;
          songName = "";
          description = "";
          category = categories[0];
          currentStep = 1;
          dragActive = false;
          globalDragCounter = 0;
        }
      }, 300);
    }
  });

  async function uploadFile(file: File) {
    // Sanitize the file name for storage
    const storageFileName = file.name
      .replace(/\.[^.]+$/, "") // Remove file extension
      .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsupported chars with dash
      .replace(/\s+/g, "-") // Replace spaces with dash
      .toLowerCase(); // Convert to lowercase for consistency

    const timestamp = new Date().toISOString().replace(/[:.]/g, "");

    const storagePath = `${project.slug}/${storageFileName}_${timestamp}`;
    const { error: storageError } = await supabase.storage
      .from("project_files")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    return { storagePath, storageError };
  }
</script>

<svelte:window />

<!-- Wskaźnik przeciągania na całej stronie -->
{#if isOpen && dragActive}
  <div
    class="fixed inset-0 bg-blue-500/10 pointer-events-none z-50 backdrop-blur-sm flex items-center justify-center"
  >
    <div
      class="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center transform scale-110 transition-transform"
    >
      <Upload size={48} class="text-blue-400 mx-auto mb-3 animate-bounce" />
      <p class="text-white text-xl font-medium">Upuść plik audio</p>
    </div>
  </div>
{/if}

<Modal
  bind:isOpen
  title={currentStep === 1 ? "Dodaj nowy utwór" : "Szczegóły utworu"}
  isLoading={isUploading}
  size="lg"
>
  <!-- Input file zawsze dostępny, niezależnie od kroku -->
  <input
    type="file"
    id="audio-file"
    name="file"
    accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mp3,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/flac"
    class="hidden"
    onchange={handleFileSelect}
  />

  {#if isUploading}
    <div class="flex flex-col items-center justify-center py-8">
      <Loader2 class="animate-spin mb-4 text-blue-500" size={40} />
      <span class="text-lg text-white font-medium mb-1"
        >Trwa przesyłanie pliku...</span
      >
      <p class="text-sm text-gray-400">
        Prosimy nie zamykać ani nie odświeżać strony
      </p>
    </div>
  {:else if currentStep === 1}
    <!-- Informacja o możliwości przeciągania plików -->
    <div
      class="bg-gray-800/50 rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all min-h-[240px]"
    >
      <div class="mb-4">
        <div
          class="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4"
        >
          <Upload size={32} class="text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-white mb-2">
          Przeciągnij plik audio w dowolne miejsce
        </h3>
        <p class="text-gray-400">lub</p>
      </div>

      <button
        type="button"
        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2 text-white font-medium"
        onclick={() => document.getElementById("audio-file")?.click()}
      >
        <FileMusic size={18} />
        Wybierz plik
      </button>

      <p class="text-xs text-gray-500 mt-6">
        Obsługiwane formaty: MP3, WAV, M4A, AAC, OGG, FLAC
        <br />
        Maksymalna wielkość pliku: 50 MB
      </p>
    </div>
  {:else if currentStep === 2}
    <form
      class="space-y-6"
      onsubmit={async () => {
        isUploading = true;

        if (!selectedFile) {
          isUploading = false;
          toast.error("Nie wybrano pliku");
          return;
        }

        const { storagePath, storageError } = await uploadFile(selectedFile);

        if (storageError) {
          isUploading = false;
          toast.error(storageError.message);
          return;
        }

        const trackFileToCreate: TrackFileCreate = {
          storage_path: storagePath,
          category_id: category.id,
          description,
          duration: 0,
          file_size: selectedFile.size,
          file_extension: selectedFile.type,
          file_name: selectedFile.name,
          is_primary: true,
        };

        try {
          const response = await fetch("/api/tracks", {
            method: "POST",
            body: JSON.stringify({
              projectId: project.id,
              trackName: songName,
              categoryId: category.id,
              file: trackFileToCreate,
            }),
          });

          if (!response.ok) {
            console.log(response);
            const error = await response.json();
            console.error("Error creating track:", error);
            await supabase.storage.from("project_files").remove([storagePath]);
            isUploading = false;
            toast.error(error.message);
            return;
          }

          const track = (await response.json()) as Track;
          console.log("Created track:", track);
          const redirectUrl = `/${project.slug}/${track.slug}`;
          goto(redirectUrl);
        } catch (error) {
          console.error("Catched error creating track:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Błąd podczas tworzenia utworu"
          );
          await supabase.storage.from("project_files").remove([storagePath]);
          isUploading = false;
        }
      }}
    >
      <input type="hidden" name="project_id" value={project.id} />
      <input type="hidden" name="file_name" value={selectedFile?.name} />

      <!-- Podgląd wybranego pliku -->
      <div
        class="bg-gray-800/50 rounded-lg border border-gray-700/30 p-4 flex items-center gap-4"
      >
        <div
          class="w-12 h-12 bg-gray-700/70 rounded-md flex items-center justify-center flex-shrink-0"
        >
          <Music size={24} class="text-blue-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-white font-medium truncate">{selectedFile?.name}</p>
          <p class="text-sm text-gray-400">
            {selectedFile ? formatFileSize(selectedFile.size) : ""} ·
            {selectedFile?.type.split("/")[1].toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          class="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
          onclick={openFilePicker}
        >
          Zmień
        </button>
      </div>

      <!-- Formularz szczegółów -->
      <div class="space-y-4">
        <div class="flex gap-4 items-start">
          <div
            class="w-8 h-8 mt-1 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-800"
          >
            <Info size={16} class="text-gray-400" />
          </div>
          <div class="flex-1">
            <Input
              label="Nazwa utworu"
              id="song-name"
              type="text"
              name="name"
              bind:value={songName}
              required
            />
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <div
            class="w-8 h-8 mt-1 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-800"
          >
            <Tag size={16} class="text-gray-400" />
          </div>
          <div class="flex-1">
            <label
              for="category-buttons"
              class="block text-sm font-medium text-gray-300 mb-1"
              >Kategoria</label
            >
            <div id="category-buttons" class="flex flex-wrap gap-2">
              {#each categories as cat}
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-full text-sm transition-all {category.id ===
                  cat.id
                    ? 'text-white font-semibold bg-blue-600'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'}"
                  onclick={() => (category = cat)}
                >
                  {cat.name}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <div
            class="w-8 h-8 mt-1 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-800"
          >
            <User size={16} class="text-gray-400" />
          </div>
          <div class="flex-1">
            <label
              for="description"
              class="block text-sm font-medium text-gray-300 mb-1"
              >Opis (opcjonalnie)</label
            >
            <textarea
              id="description"
              name="description"
              rows="3"
              class="w-full px-3 py-2 bg-gray-800/70 border border-gray-700/50 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Dodaj krótki opis pliku..."
              bind:value={description}
            ></textarea>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <Button
          primary
          fullWidth
          type="submit"
          disabled={!selectedFile || !songName}
        >
          Dodaj utwór
        </Button>
      </div>
    </form>
  {/if}
</Modal>
