<script lang="ts">
  import FileUploadModal from "$lib/components/ui/FileUploadModal.svelte";
  import type { TrackCategory } from "$lib/types/track_category";
  import { CheckSquare, Info, Square, Tag, User } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let {
    isOpen = $bindable(),
    trackId,
    categories = [],
    onFileUploaded,
  }: {
    isOpen: boolean;
    trackId: number;
    categories: TrackCategory[];
    onFileUploaded?: () => void;
  } = $props();

  let selectedCategory: TrackCategory | null = $state(null);
  let isPrimary = $state(false);
  let description = $state("");

  // Funkcja obsługująca upload pliku (na razie pusta)
  async function uploadFile(file: File): Promise<void> {
    // Tutaj będzie implementacja uploadu pliku
    console.log("Uploading file:", file);
    console.log("Track ID:", trackId);
    console.log("Category:", selectedCategory);
    console.log("Is Primary:", isPrimary);
    console.log("Description:", description);

    // Symulacja uploadu
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Funkcja wywoływana po zakończeniu uploadu
  function handleFileUploaded() {
    // Reset stanu
    selectedCategory = null;
    isPrimary = false;
    description = "";

    // Wywołaj callback, jeśli istnieje
    if (onFileUploaded) {
      onFileUploaded();
    }
  }
</script>

<FileUploadModal
  bind:isOpen
  title="Szczegóły utworu"
  acceptedFileTypes=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*"
  maxSizeInMB={50}
  {uploadFile}
  onFileUploaded={handleFileUploaded}
>
  {#snippet additionalFields()}
    <div class="space-y-6 py-2">
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
          class="text-gray-300 hover:text-white transition-colors"
          onclick={() => (isPrimary = !isPrimary)}
          aria-label="Główny plik utworu"
        >
          {#if isPrimary}
            <CheckSquare size={20} class="text-blue-500" />
          {:else}
            <Square size={20} />
          {/if}
        </button>
        <label for="primary-checkbox" class="text-sm text-gray-200"
          >Ustaw jako główny plik utworu</label
        >
        <input
          id="primary-checkbox"
          type="checkbox"
          class="hidden"
          bind:checked={isPrimary}
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
