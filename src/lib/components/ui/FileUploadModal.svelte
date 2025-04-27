<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import { FileMusic, Loader2, Music, Upload } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { onDestroy, onMount } from "svelte";
  import Button from "./Button.svelte";

  let {
    isOpen = $bindable(),
    title = "Dodaj plik",
    acceptedFileTypes = ".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*",
    maxSizeInMB = 50,
    onClose,
    uploadFile,
    onFileUploaded,
    beforeFilePreview,
    afterFilePreview,
    additionalFields,
  }: {
    isOpen: boolean;
    title?: string;
    acceptedFileTypes?: string;
    maxSizeInMB?: number;
    onClose?: () => void;
    uploadFile: (file: File) => Promise<any | null>;
    onFileUploaded?: (uploadedFile?: any) => void;
    beforeFilePreview?: Snippet;
    afterFilePreview?: Snippet;
    additionalFields?: Snippet;
  } = $props();

  let selectedFile = $state<File | null>(null);
  let isUploading = $state(false);
  let dragActive = $state(false);
  let globalDragCounter = $state(0);

  // Formatowanie rozmiaru pliku
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

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

    // Obsługuj upuszczenie, jeśli modal jest otwarty
    if (isOpen && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      // Sprawdź typ pliku
      const isAcceptedFileType = acceptedFileTypes.split(",").some((type) => {
        if (type.startsWith(".")) {
          // Sprawdź rozszerzenie
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else if (type.includes("/*")) {
          // Sprawdź typ MIME (np. audio/*)
          const mainType = type.split("/")[0];
          return file.type.startsWith(`${mainType}/`);
        } else {
          // Dokładny typ MIME
          return file.type === type;
        }
      });

      if (!isAcceptedFileType) {
        toast.error(
          `Nieobsługiwany format pliku. Obsługiwane formaty: ${acceptedFileTypes}`
        );
        return;
      }

      if (file.size > maxSizeInBytes) {
        toast.error(
          `Plik jest zbyt duży. Maksymalny rozmiar to ${maxSizeInMB} MB`
        );
        return;
      }

      selectedFile = file;
    }
  }

  // Obsługa wyboru pliku przez input
  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        toast.error(
          `Plik jest zbyt duży. Maksymalny rozmiar to ${maxSizeInMB} MB`
        );
        return;
      }

      selectedFile = file;
    }
  }

  // Otwórz selektor plików
  function openFilePicker() {
    document.getElementById("file-input")?.click();
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

  // Reset stanu przy zamknięciu modalu
  $effect(() => {
    if (!isOpen) {
      setTimeout(() => {
        if (!isOpen) {
          selectedFile = null;
          isUploading = false;
          dragActive = false;
        }
      }, 300);
    }
  });

  // Funkcja do zamknięcia modalu
  function handleClose() {
    isOpen = false;
    if (onClose) onClose();
  }

  async function handleUpload() {
    isUploading = true;

    if (!selectedFile) {
      isUploading = false;
      toast.error("Nie wybrano pliku");
      throw new Error("Nie wybrano pliku");
    }

    const uploadedFile = await uploadFile(selectedFile);

    if (onFileUploaded) {
      onFileUploaded(uploadedFile);
    }

    handleClose();
  }
</script>

<svelte:window />

<!-- Wskaźnik przeciągania na całej stronie -->
{#if dragActive && isOpen}
  <div
    class="fixed inset-0 bg-blue-500/10 pointer-events-none z-50 flex items-center justify-center"
  >
    <div
      class="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center transform scale-110 transition-transform"
    >
      <Upload size={48} class="text-blue-400 mx-auto mb-3 animate-bounce" />
      <p class="text-white text-xl font-medium">Upuść plik</p>
    </div>
  </div>
{/if}

<Modal
  bind:isOpen
  {title}
  isLoading={isUploading}
  size="lg"
  onClose={handleClose}
>
  <!-- Input file zawsze dostępny -->
  <input
    type="file"
    id="file-input"
    name="file"
    accept={acceptedFileTypes}
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
  {:else if !selectedFile}
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
          Przeciągnij plik w dowolne miejsce
        </h3>
        <p class="text-gray-400">lub</p>
      </div>

      <button
        type="button"
        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2 text-white font-medium"
        onclick={openFilePicker}
      >
        <FileMusic size={18} />
        Wybierz plik
      </button>

      <p class="text-xs text-gray-500 mt-6">
        Obsługiwane formaty: {acceptedFileTypes
          .replace(/\./g, "")
          .toUpperCase()
          .replace(/,/g, ", ")}
        <br />
        Maksymalna wielkość pliku: {maxSizeInMB} MB
      </p>
    </div>
  {:else}
    <!-- Podgląd wybranego pliku -->
    <div class="space-y-6">
      <!-- Snippet przed podglądem pliku -->
      {@render beforeFilePreview?.()}

      <div
        class="bg-gray-800/50 rounded-lg border border-gray-700/30 p-4 flex items-center gap-4"
      >
        <div
          class="w-12 h-12 bg-gray-700/70 rounded-md flex items-center justify-center flex-shrink-0"
        >
          <Music size={24} class="text-blue-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-white font-medium truncate">{selectedFile.name}</p>
          <p class="text-sm text-gray-400">
            {formatFileSize(selectedFile.size)} ·
            {selectedFile.type
              ? selectedFile.type.split("/")[1].toUpperCase()
              : "NIEZNANY"}
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

      <!-- Snippet po podglądzie pliku -->
      {@render afterFilePreview?.()}

      <!-- Dodatkowe pola formularza -->
      {#if additionalFields}
        <div class="mt-4 space-y-4">
          {@render additionalFields()}
        </div>
      {/if}

      <!-- Przycisk akcji -->
      <Button
        fullWidth
        variant="accent"
        disabled={isUploading}
        onclick={handleUpload}
      >
        Prześlij plik
      </Button>
    </div>
  {/if}
</Modal>

<style>
  /* Dodatkowe style, jeśli potrzebne */
</style>
