<script lang="ts">
  import FileUploadModal from "$lib/components/ui/FileUploadModal.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { DEV_FILE_UPLOAD } from "$lib/config";
  import { getSupabaseContext } from "$lib/supabase-context";
  import type { TrackCategory } from "$lib/types/track_category";
  import { CheckSquare, FileIcon, Info, Square, Tag } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import toast from "svelte-french-toast";
  import Input from "../ui/Input.svelte";

  let {
    isOpen = $bindable(),
    trackId,
    projectSlug,
    categories = [],
    onFileUploaded,
  }: {
    isOpen: boolean;
    trackId: number;
    projectSlug: string;
    categories: TrackCategory[];
    onFileUploaded?: (uploadedFile: any) => void;
  } = $props();

  let selectedCategory: TrackCategory | null = $state(null);
  let isDefault = $state(false);
  let fileName = $state("");
  let description = $state("");

  const supabase = getSupabaseContext();

  async function uploadToStorage(file: File) {
    if (DEV_FILE_UPLOAD) {
      return {
        storagePath: "test/best-song-ever--9-_2025-03-19T225832229Z",
        storageError: null,
      };
    }

    const storageFileName = file.name
      .replace(/\.[^.]+$/, "") // Remove file extension
      .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsupported chars with dash
      .replace(/\s+/g, "-") // Replace spaces with dash
      .toLowerCase(); // Convert to lowercase for consistency

    const timestamp = new Date().toISOString().replace(/[:.]/g, "");

    const storagePath = `${projectSlug}/${storageFileName}_${timestamp}`;
    const { error: storageError } = await supabase.storage
      .from("project_files")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    return { storagePath, storageError };
  }

  // Funkcja obsługująca upload pliku
  async function uploadFile(file: File) {
    console.log("uploading file", file);

    const { storagePath, storageError } = await uploadToStorage(file);
    if (storageError) {
      toast.error("Nie udało się dodać pliku do projektu.", {
        position: "bottom-right",
      });
      return;
    }

    const response = await fetch(`/api/tracks/${trackId}/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storage_path: storagePath,
        category_id: selectedCategory?.id,
        is_default: isDefault,
        description: description,
        file_extension: file.name.split(".").pop() || "",
        file_name: fileName,
        file_size: file.size,
      }),
    });

    if (!response.ok) {
      // Usuń plik ze storage w razie niepowodzenia
      await supabase.storage.from("project_files").remove([storagePath]);
      const error = await response.json();
      toast.error(error.message || "Nie udało się dodać pliku do utworu.", {
        position: "bottom-right",
      });
      return;
    }

    // Zwracamy utworzony plik
    return await response.json();
  }

  // Funkcja wywoływana po zakończeniu uploadu
  function handleFileUploaded(uploadedFile: any) {
    // Reset stanu
    selectedCategory = null;
    isDefault = false;
    description = "";
    fileName = "";

    // Wywołaj callback z nowo utworzonym plikiem, jeśli istnieje
    console.log("File uploaded:", uploadedFile);
    if (onFileUploaded && uploadedFile) {
      console.log("File uploaded");
      onFileUploaded(uploadedFile);
    }
  }

  function handleFileSelected(file: File) {
    fileName = file.name.split(".").shift() || "";
  }
</script>

<FileUploadModal
  bind:isOpen
  title="Dodaj nowy plik do utworu"
  acceptedFileTypes=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*"
  maxSizeInMB={50}
  {uploadFile}
  onFileUploaded={handleFileUploaded}
  onFileSelected={handleFileSelected}
>
  {#snippet additionalFields()}
    <div class="space-y-6 py-2">
      <!-- Nazwa pliku -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          <FileIcon size={18} class="text-gray-400" />
        </div>
        <div class="flex-1">
          <Input
            label="Nazwa pliku"
            id="file-name"
            type="text"
            name="file_name"
            bind:value={fileName}
            required
          />
        </div>
      </div>
      <!-- Pole wyboru kategorii -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          <Tag size={18} class="text-gray-400" />
        </div>
        <div class="flex-1">
          <label
            for="category-select"
            class="block text-sm font-medium text-gray-200 mb-2"
            >Kategoria</label
          >
          <div id="category-select" class="sr-only" aria-hidden="true"></div>
          <div class="flex flex-wrap gap-2">
            {#each categories as cat}
              <button
                type="button"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {selectedCategory?.id ===
                cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}"
                onclick={() => (selectedCategory = cat)}
              >
                {cat.name}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Checkbox czy plik jest główny -->
      <div class="flex items-center gap-2 mt-2">
        <button
          type="button"
          class="text-gray-300 hover:text-white transition-colors flex-shrink-0"
          onclick={() => (isDefault = !isDefault)}
          aria-label="Główny plik utworu"
        >
          {#if isDefault}
            <CheckSquare size={20} class="text-blue-500" />
          {:else}
            <Square size={20} />
          {/if}
        </button>
        <label for="primary-checkbox" class="text-sm text-gray-200"
          >Domyślny plik utworu</label
        >
        <Tooltip
          content="Domyślnie ustawiany jako wybrany plik przy wejściu na stronę utworu."
        />
        <input
          id="primary-checkbox"
          type="checkbox"
          class="hidden"
          bind:checked={isDefault}
        />
      </div>

      <!-- Pole opisu -->
      <div class="flex items-start gap-3 mt-2">
        <div class="flex-shrink-0 mt-1">
          <Info size={18} class="text-gray-400" />
        </div>
        <div class="flex-1">
          <label
            for="description"
            class="block text-sm font-medium text-gray-200 mb-2"
            >Opis (opcjonalnie)</label
          >
          <textarea
            id="description"
            name="description"
            rows="3"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Dodaj krótki opis pliku..."
            bind:value={description}
          ></textarea>
        </div>
      </div>
    </div>
  {/snippet}
</FileUploadModal>
