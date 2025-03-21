<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import TrackComments from "$lib/components/tracks/comment/TrackComments.svelte";
  import NewFileModal from "$lib/components/tracks/NewFileModal.svelte";
  import AudioPlayer from "$lib/components/ui/AudioPlayer.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import FileUploadModal from "$lib/components/ui/FileUploadModal.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import UserAvatar from "$lib/components/UserAvatar.svelte";
  import { setSupabaseContext } from "$lib/supabase-context";
  import type { TrackCategory } from "$lib/types/track_category";
  import type { TrackFile } from "$lib/types/track_file";
  import { format } from "date-fns";
  import { CircleCheckBig, Plus, Send, Star } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import toast from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const { supabase } = data;
  setSupabaseContext(supabase);

  const { categories } = data;

  let showMobileComments = $state(false);

  let track = $state(data.track);
  let defaultFileId = $derived(track.default_file_id);

  let comments = $state(data.track.comments || []);
  let files = $state(data.track.files || []);

  function isFilePrimary(file: TrackFile): boolean {
    return file.id === defaultFileId;
  }

  let selectedCategory: TrackCategory | null = $state(null);
  let selectedFile = $state(() => files.find((file) => isFilePrimary(file)));

  let isFileUploadModalOpen = $state(false);

  let audioUrl = $state<string | null>(null);

  onMount(() => {
    if (selectedFile()) {
      getAudioUrl();
    }
  });

  async function getAudioUrl() {
    try {
      const { data: audio, error: audioError } = await supabase.storage
        .from("project_files")
        .createSignedUrl(selectedFile()!.storage_path, 3600);

      if (audioError) {
        throw new Error(audioError.message || "Nie udało się załadować audio");
      }

      audioUrl = audio.signedUrl;
      console.log("audioUrl:", audioUrl);
    } catch (err) {
      console.error("Błąd podczas ładowania audio:", err);
      toast.error(
        err instanceof Error ? err.message : "Nie udało się załadować audio",
        {
          position: "bottom-right",
        }
      );
    }
  }

  async function addComment(content: string) {
    try {
      const response = await fetch(`/api/tracks/${track.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się dodać komentarza");
      }

      return await response.json();
    } catch (err) {
      return null;
    }
  }

  async function onFileUploaded(uploadedFile: any) {
    console.log("File uploaded:", uploadedFile);
    // Dodaj nowy plik do listy plików
    if (uploadedFile) {
      const { data: trackData, error } = await supabase
        .from("tracks")
        .select(
          "*, uploaded_by(*), comments:track_comments(*, user:user_id(*)), files:track_files(*, uploaded_by(*), category:category_id(*))"
        )
        .eq("project_id", data.project.id)
        .eq("slug", data.track.slug)
        .single();
      if (error) {
        console.error(
          "Nie udało się pobrać danych utworu po uploadzie pliku.",
          error
        );
        toast.error("Nie udało się pobrać danych utworu po uploadzie pliku.", {
          position: "bottom-right",
        });
        return;
      }

      track = trackData;
      // Dodaj nowy plik do istniejącej listy
      files = [uploadedFile, ...files];

      selectedFile = () => uploadedFile;
      getAudioUrl();

      toast.success("Plik został dodany do utworu.", {
        position: "bottom-right",
      });
    }
  }

  async function downloadFile(file: TrackFile) {
    const { data, error } = await supabase.storage
      .from("project_files")
      .download(file.storage_path);

    if (error) {
      toast.error("Nie udało się pobrać pliku.", {
        position: "bottom-right",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.file_name;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Rozpoczęto pobieranie pliku.", {
      position: "bottom-right",
    });
  }

  async function setFileDefault(file: TrackFile) {
    const response = await fetch(`/api/tracks/${track.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        defaultFileId: file.id,
      }),
    });

    if (!response.ok) {
      toast.error("Nie udało się ustawić pliku jako domyślny.", {
        position: "bottom-right",
      });
      return;
    }

    track = await response.json();

    toast.success("Plik został ustawiony jako domyślny.", {
      position: "bottom-right",
    });
  }
</script>

<!-- Główny kontener z flexbox dla układu dwukolumnowego -->
<div class="flex flex-col lg:flex-row h-full overflow-hidden">
  <!-- Główna zawartość z odtwarzaczem na dole -->
  <div
    class="flex-1 flex flex-col overflow-hidden {showMobileComments
      ? 'hidden lg:flex'
      : 'flex'}"
  >
    <!-- Główna zawartość z przewijaniem -->
    <div
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
    >
      <!-- Nagłówek strony -->
      <div class="p-4 sm:p-6">
        <!-- Breadcrumbs i przyciski akcji -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="flex-1">
            <Breadcrumbs project={data.project} track={data.track} />
          </div>

          <div
            class="flex flex-col xs:flex-row w-full sm:w-auto gap-2 mt-2 sm:mt-0"
          >
            <!-- Przycisk komentarzy (tylko na mobilnych i tabletach) -->
            <button
              class="lg:hidden flex items-center justify-center gap-2 py-2 px-3 sm:py-1.5 sm:px-2.5 w-full xs:w-auto bg-gray-700/50 hover:bg-gray-700 text-white rounded-md transition-colors"
              onclick={() => (showMobileComments = true)}
              aria-label="Pokaż komentarze"
            >
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
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                ></path>
              </svg>
              <span>Komentarze</span>
              <span
                class="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >{comments.length}</span
              >
            </button>

            <!-- Przycisk dodawania pliku -->
            <button
              class="flex items-center justify-center gap-2 py-2 px-3 sm:py-1.5 sm:px-2.5 w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              aria-label="Dodaj plik"
              onclick={() => (isFileUploadModalOpen = true)}
            >
              <Plus size={18} />
              <span>Dodaj plik</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Główna zawartość strony -->
      <div class="container mx-auto p-4 sm:p-6 max-w-screen-xl">
        <!-- Filtrowanie po kategorii -->
        <div class="mb-6">
          <div class="flex flex-wrap gap-3">
            <button
              class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory ===
              null
                ? 'text-white font-semibold'
                : 'text-gray-400 hover:text-white'}"
              onclick={() => (selectedCategory = null)}
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
                class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory?.id ===
                category.id
                  ? 'text-white font-semibold'
                  : 'text-gray-400 hover:text-white'}"
                onclick={() => (selectedCategory = category)}
              >
                {category.name}
                {#if selectedCategory?.id === category.id}
                  <span
                    class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 mx-auto w-3/4 animate-fadeIn"
                  ></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Lista plików audio -->
        <div class="space-y-3">
          {#each files
            .filter((file) => selectedCategory === null || file.category.id === selectedCategory.id)
            .sort( (a, b) => (isFilePrimary(a) ? -1 : isFilePrimary(b) ? 1 : 0) ) as file, index (file.id)}
            {#if index === 1 && files.some((f) => isFilePrimary(f) && (selectedCategory === null || f.category.id === selectedCategory.id))}
              <div class=" border-t border-gray-700/50 m-4"></div>
            {/if}
            <div
              in:slide={{ duration: 500 }}
              out:fade={{ duration: 500 }}
              class="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg border border-gray-700/30 transition-all overflow-hidden cursor-pointer"
              onclick={() => {
                if (selectedFile()?.id !== file.id) {
                  selectedFile = () => file;
                  getAudioUrl();
                }
              }}
              aria-label="Wybierz plik"
              role="button"
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (selectedFile()?.id !== file.id) {
                    selectedFile = () => file;
                    getAudioUrl();
                  }
                }
              }}
            >
              <!-- Pasek boczny wskazujący czy plik jest wybrany -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1 {selectedFile()
                  ?.id === file.id
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
                      {#if isFilePrimary(file)}
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
                    {#if !isFilePrimary(file)}
                      <button
                        class="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-gray-400 hover:text-gray-300 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Ustaw plik jako domyślny"
                        onclick={(e) => {
                          e.stopPropagation();
                          setFileDefault(file);
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
                        // Tutaj będzie funkcja do usuwania pliku
                        // deleteFile(file);
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
          {/each}
        </div>
      </div>
    </div>

    <!-- Odtwarzacz audio na dole lewej kolumny -->
    <AudioPlayer bind:audioUrl />
  </div>

  <!-- Panel komentarzy -->
  <TrackComments bind:comments bind:showMobileComments {addComment} />
</div>

<NewFileModal
  bind:isOpen={isFileUploadModalOpen}
  projectSlug={data.project.slug}
  trackId={data.track.id}
  {categories}
  {onFileUploaded}
/>

<style>
  /* Styl zapobiegający zaznaczaniu tekstu podczas przeciągania paska postępu */
  :global(.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
</style>
