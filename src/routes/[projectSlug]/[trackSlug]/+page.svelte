<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import TrackComments from "$lib/components/tracks/comment/TrackComments.svelte";
  import NewFileModal from "$lib/components/tracks/NewFileModal.svelte";
  import TrackFilesList from "$lib/components/tracks/TrackFilesList.svelte";
  import AudioPlayer from "$lib/components/ui/AudioPlayer.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import { setSupabaseContext } from "$lib/supabase-context";
  import type { TrackFile } from "$lib/types/track_file";
  import { Plus } from "lucide-svelte";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const { supabase } = data;
  setSupabaseContext(supabase);

  const { categories } = data;

  let showMobileComments = $state(false);

  let track = $state(data.track);
  let defaultFileId = $state(data.track.default_file_id!);

  let comments = $state(data.track.comments || []);
  let files = $state(data.track.files || []);

  let selectedFile = $state(
    data.track.files.find((file) => file.id === defaultFileId)!
  );

  let isFileUploadModalOpen = $state(false);

  let audioUrl = $state<string | null>(null);

  let isDeleteModalOpen = $state(false);
  let isDeleteDefaultModalOpen = $state(false);
  let fileToDelete: TrackFile | null = null;

  onMount(() => {
    if (selectedFile) {
      getAudioUrl();
    }
  });

  function onFileSelected(file: TrackFile) {
    getAudioUrl();
  }

  async function getAudioUrl() {
    try {
      const { data: audio, error: audioError } = await supabase.storage
        .from("project_files")
        .createSignedUrl(selectedFile.storage_path, 3600);

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

      selectedFile = uploadedFile;
      getAudioUrl();

      toast.success("Plik został dodany");
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

  async function changeDefaultFile(file: TrackFile) {
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
    if (!track.default_file_id) {
      console.error("Nie udało się ustawić pliku jako domyślny.");
      toast.error("Nie udało się ustawić pliku jako domyślny.");
      return;
    }

    defaultFileId = track.default_file_id!;
    toast.success("Plik został ustawiony jako domyślny.", {
      position: "bottom-right",
    });
  }

  async function deleteFile(file: TrackFile) {
    console.trace("Usuwanie pliku:", file);
    await supabase.storage.from("track_files").remove([file.storage_path]);

    const response = await toast.promise(
      fetch(`/api/files/${file.id}`, {
        method: "DELETE",
      }),
      {
        loading: "Usuwanie pliku...",
        success: "Plik został usunięty.",
        error: "Nie udało się usunąć pliku.",
      }
    );

    if (!response.ok) {
      toast.error("Nie udało się usunąć pliku.");
      return;
    }

    if (selectedFile.id === file.id) {
      const file = files.find((f) => f.id !== defaultFileId);
      selectedFile = file ?? files[0];
    }
    files = files.filter((f) => f.id !== file.id);
    fileToDelete = null;
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
      <div class="container mx-auto p-4 sm:p-6 max-w-screen-xl">
        <TrackFilesList
          bind:files
          bind:selectedFile
          bind:defaultFileId
          {categories}
          {onFileSelected}
          {changeDefaultFile}
          {downloadFile}
          deleteFile={(file) => {
            if (file.id === defaultFileId) {
              isDeleteDefaultModalOpen = true;
            } else {
              isDeleteModalOpen = true;
              fileToDelete = file;
            }
          }}
        />
      </div>
    </div>

    <AudioPlayer bind:audioUrl />
  </div>
  <TrackComments bind:comments bind:showMobileComments {addComment} />
</div>

<NewFileModal
  bind:isOpen={isFileUploadModalOpen}
  projectSlug={data.project.slug}
  trackId={data.track.id}
  {categories}
  {onFileUploaded}
/>

<!-- Modal usuwania pliku -->
<ConfirmModal
  bind:isOpen={isDeleteModalOpen}
  onClose={() => {
    isDeleteModalOpen = false;
    console.log("isDeleteModalOpen onClose", isDeleteModalOpen);
  }}
  onConfirm={() => {
    if (fileToDelete) deleteFile(fileToDelete);
  }}
  title="Usuń plik"
  buttonVariant="danger"
  buttonText="Usuń"
>
  <p>Czy na pewno chcesz usunąć ten plik? Tej operacji nie można cofnąć.</p>
</ConfirmModal>

<!-- Modal usuwania domyślnefgo pliku -->
<ConfirmModal
  bind:isOpen={isDeleteDefaultModalOpen}
  onClose={() => {
    isDeleteDefaultModalOpen = false;
  }}
  onConfirm={() => {}}
  title="Usuń plik"
  buttonText="Usuń utwór"
  buttonVariant="danger"
>
  <p>Usunięcie tego pliku spowoduje usunięcie całego utworu. Kontynuować?</p>
</ConfirmModal>

<style>
  /* Styl zapobiegający zaznaczaniu tekstu podczas przeciągania paska postępu */
  :global(.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
</style>
