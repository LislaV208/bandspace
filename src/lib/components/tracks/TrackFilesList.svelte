<script lang="ts">
  import type { TrackCategory } from "$lib/types/track_category";
  import type { TrackFile } from "$lib/types/track_file";
  import { format } from "date-fns";
  import { CircleCheckBig } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";
  import { crossfade } from "svelte/transition";
  import Tooltip from "../ui/Tooltip.svelte";
  
  // Tworzę niestandardowe przejście, które łączy fade i slide
  function fadeSlide(node: HTMLElement, { delay = 0, duration = 300 }: { delay?: number; duration?: number }) {
    return {
      delay,
      duration,
      css: (t: number) => {
        const eased = t * (2 - t); // easing function
        return `
          opacity: ${eased};
          transform: translateY(${(1 - eased) * 15}px);
        `;
      }
    };
  }

  let {
    files = $bindable(),
    selectedFile = $bindable(),
    defaultFileId = $bindable(),
    categories,
    onFileSelected,
    changeDefaultFile,
    downloadFile,
    deleteFile,
  }: {
    files: TrackFile[];
    selectedFile: TrackFile;
    defaultFileId: number;
    categories: TrackCategory[];
    onFileSelected: (file: TrackFile) => void;
    changeDefaultFile: (file: TrackFile) => void;
    downloadFile: (file: TrackFile) => void;
    deleteFile: (file: TrackFile) => void;
  } = $props();
  let selectedCategory = $state<TrackCategory | null>(null);
  let currentDefaultFileId = $state<number>(defaultFileId);

  $effect(() => {
    if (defaultFileId !== currentDefaultFileId) {
      currentDefaultFileId = defaultFileId;
    }
  });

  function isCategorySelected(category: TrackCategory): boolean {
    return category.id === selectedCategory?.id;
  }

  function isFileDefault(file: TrackFile): boolean {
    return file.id === currentDefaultFileId;
  }

  function setCategory(category: TrackCategory | null): void {
    selectedCategory = category;
  }
</script>

<div class="mb-6">
  <div class="flex flex-wrap gap-3">
    <button
      class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory ===
      null
        ? 'text-white font-semibold'
        : 'text-gray-400 hover:text-white'}"
      onclick={() => setCategory(null)}
    >
      Wszystkie
      {#if selectedCategory === null}
        <span
          class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 mx-auto w-3/4 animate-fadeIn"
        ></span>
      {/if}
    </button>
    {#each categories as category}
      <button
        class="relative px-4 py-2 rounded-full text-sm transition-all {isCategorySelected(
          category
        )
          ? 'text-white font-semibold'
          : 'text-gray-400 hover:text-white'}"
        onclick={() => setCategory(category)}
      >
        {category.name}
        {#if isCategorySelected(category)}
          <span
            class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 mx-auto w-3/4 animate-fadeIn"
          ></span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<div class="space-y-3">
  {#each files
    .filter((file) => selectedCategory === null || file.category.id === selectedCategory.id)
    .sort( (a, b) => (isFileDefault(a) ? -1 : isFileDefault(b) ? 1 : 0) ) as file, index (file.id)}
    <div>
      {#if index === 1 && files.some((f) => isFileDefault(f) && (selectedCategory === null || f.category.id === selectedCategory.id))}
        <div class="border-t border-gray-700/50 my-4"></div>
      {/if}
      <div
        in:fadeSlide|local={{ duration: 300, delay: 50 }}
        out:fadeSlide|local={{ duration: 200, delay: 0 }}
        class="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg border border-gray-700/30 transition-all overflow-hidden cursor-pointer"
        onclick={() => {
          if (selectedFile.id !== file.id) {
            selectedFile = file;
            onFileSelected(file);
          }
        }}
        aria-label="Wybierz plik"
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (selectedFile?.id !== file.id) {
              selectedFile = file;
              onFileSelected(file);
            }
          }
        }}
      >
        <!-- Pasek boczny wskazujący czy plik jest wybrany -->
        <div
          class="absolute left-0 top-0 bottom-0 w-1 {selectedFile.id === file.id
            ? 'bg-blue-400'
            : ''}"
        ></div>

        <!-- Główna zawartość -->
        <div class="pl-4 pr-3 py-3">
          <div class="flex items-start">
            <!-- Format pliku -->
            <div
              class="w-12 h-12 mr-3 mt-1 bg-gray-700/50 rounded-md flex items-center justify-center flex-shrink-0"
            >
              <div class="text-center font-medium text-sm">
                {file.file_name.split(".").pop()}
              </div>
            </div>

            <!-- Środkowa część z informacjami o pliku -->
            <div class="flex-grow min-w-0 overflow-visible pr-3">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <!-- Nazwa pliku -->
                <h3
                  class="text-base font-medium text-white truncate max-w-full"
                >
                  {file.file_name}
                </h3>
                {#if isFileDefault(file)}
                  <div class="inline-flex items-center ml-1">
                    <Tooltip
                      content="Plik domyślny"
                      position="right"
                      width="w-32"
                    >
                      <CircleCheckBig
                        size={16}
                        class="text-blue-400 hover:text-blue-300"
                      />
                    </Tooltip>
                  </div>
                {/if}
              </div>

              <!-- Opis pliku (zawsze widoczny) -->
              {#if file.description}
                <p class="text-gray-400 text-sm line-clamp-1 mb-1.5">
                  {file.description}
                </p>
              {/if}

              <!-- Dodatkowe informacje -->
              <div
                class="flex items-center text-xs text-gray-400 flex-wrap gap-x-3 gap-y-1.5 mt-1.5"
              >
                <!-- Autor -->
                <span class="flex items-center">
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  {file.uploaded_by.name}
                </span>

                <!-- Data dodania -->
                <span class="flex items-center">
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  {format(new Date(file.created_at), "dd-MM-yyyy")}
                </span>

                <!-- Kategoria -->
                <!-- class="bg-{file.category === 'Demo'
                        ? 'yellow-300'
                        : file.category === 'Instrumenty'
                          ? 'green'
                          : 'blue'}-500/20 text-{file.category === 'Demo'
                        ? 'yellow-600'
                        : file.category === 'Instrumenty'
                          ? 'green'
                          : 'blue'}-300 px-2 py-0.5 rounded-full" -->
                <span
                  class="bg-blue-500/20 text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded-full transition-colors"
                >
                  {file.category.name}
                </span>
              </div>
            </div>

            <!-- Prawa strona z akcjami -->
            <div class="flex-shrink-0 ml-2 flex items-center gap-2">
              <!-- Ustaw plik jako domyślny (widoczne tylko po najechaniu) -->
              {#if !isFileDefault(file)}
                <button
                  class="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-gray-400 hover:text-gray-300 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Ustaw plik jako domyślny"
                  onclick={(e) => {
                    e.stopPropagation();
                    changeDefaultFile(file);
                  }}
                >
                  <CircleCheckBig size={18} />
                </button>
              {/if}
              <!-- Usuń plik (widoczne tylko po najechaniu) -->
              <button
                class="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded-full transition-all opacity-0 group-hover:opacity-100"
                aria-label="Usuń plik"
                onclick={(e) => {
                  e.stopPropagation();
                  deleteFile(file);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
              <!-- Pobierz (zawsze widoczny) -->
              <button
                class="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-full transition-colors"
                aria-label="Pobierz plik"
                onclick={(e) => {
                  e.stopPropagation();
                  downloadFile(file);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
              </button>

              <!-- Więcej opcji (widoczne po najechaniu) -->
              <!-- <button
                    class="p-2 ml-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Więcej opcji"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      ></path>
                    </svg>
                  </button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
