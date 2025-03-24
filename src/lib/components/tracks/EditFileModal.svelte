<script lang="ts">
  import type { TrackCategory } from "$lib/types/track_category";
  import type { TrackFile } from "$lib/types/track_file";
  import { CheckSquare, FileIcon, Info, Square, Tag } from "lucide-svelte";
  import ConfirmModal from "../ui/ConfirmModal.svelte";
  import Input from "../ui/Input.svelte";
  import Tooltip from "../ui/Tooltip.svelte";

  let {
    isOpen = $bindable(),
    file,
    selectedCategory,
    isDefault,
    categories = [],
    onConfirm,
  }: {
    isOpen: boolean;
    file: TrackFile | null;
    selectedCategory: TrackCategory;
    isDefault: boolean;
    categories: TrackCategory[];
    onConfirm: (file: {
      file_name: string;
      category: TrackCategory;
      description: string;
      isDefault: boolean;
    }) => void;
  } = $props();

  $inspect(file);

  function onConfirmInternal() {
    if (!fileName) return;

    onConfirm({
      file_name: fileName,
      category: selectedCategory,
      description: description,
      isDefault: isDefault,
    });
  }

  let fileName = $state(file?.file_name.split(".").slice(0, -1).join("."));

  // $inspect(fileName);

  let description = $state(file?.description || "");

  let currentIsDefault = $state(isDefault);

  // Aktualizuj fileName i description, gdy modal się otwiera
  $effect(() => {
    fileName = file?.file_name;
    description = file?.description || "";
    currentIsDefault = isDefault;
  });
</script>

<ConfirmModal
  bind:isOpen
  onConfirm={onConfirmInternal}
  title="Edytuj plik"
  buttonText="Edytuj"
>
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
        <!-- <input class="text-black" type="text" bind:value={fileName} required /> -->
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
          class="block text-sm font-medium text-gray-200 mb-2">Kategoria</label
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
        class=" text-gray-300 hover:text-white transition-colors flex-shrink-0"
        onclick={() => (currentIsDefault = !currentIsDefault)}
        aria-label="Główny plik utworu"
        disabled={isDefault}
      >
        {#if currentIsDefault}
          <CheckSquare
            size={20}
            class={!isDefault ? "text-blue-500" : "text-gray-300"}
          />
        {:else}
          <Square size={20} />
        {/if}
      </button>
      <label
        for="primary-checkbox"
        class="text-sm {isDefault ? 'text-gray-400' : 'text-gray-200'}"
        >Domyślny plik utworu</label
      >
      <Tooltip
        content="Domyślnie ustawiany jako wybrany plik przy wejściu na stronę utworu."
      />
      <input
        id="primary-checkbox"
        type="checkbox"
        class="hidden"
        bind:checked={currentIsDefault}
        disabled={isDefault}
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
          class="block text-sm font-medium text-gray-200 mb-2">Opis</label
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
</ConfirmModal>
