<script lang="ts">
  import { goto } from "$app/navigation";
  import FileUploadModal from "$lib/components/ui/FileUploadModal.svelte";
  import { DEV_FILE_UPLOAD } from "$lib/config";
  import { getSupabaseContext } from "$lib/supabase-context";
  import type { Project } from "$lib/types/project";
  import type { Track } from "$lib/types/track";
  import type { TrackCategory } from "$lib/types/track_category";
  import type { TrackFileCreate } from "$lib/types/track_file";
  import { File as FileIcon, Info, Tag, User } from "lucide-svelte";
  import toast from "svelte-french-toast";
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

  let songName = $state("");
  let fileName = $state("");
  let category = $state(categories[0]);
  let description = $state("");

  const supabase = getSupabaseContext();

  // Funkcja do przesyłania pliku do storage
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

    const storagePath = `${project.slug}/${storageFileName}_${timestamp}`;
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
      return null;
    }

    try {
      const trackFileToCreate: TrackFileCreate = {
        storage_path: storagePath,
        category_id: category.id,
        description,
        duration: 0,
        file_size: file.size,
        file_extension: file.name.split(".").pop() || "",
        file_name: fileName,
      };

      const response = await fetch("/api/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        toast.error(error.message, { position: "bottom-right" });
        return null;
      }

      const track = (await response.json()) as Track;
      console.log("Created track:", track);
      return track;
    } catch (error) {
      console.error("Catched error creating track:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas tworzenia utworu",
        { position: "bottom-right" }
      );
      await supabase.storage.from("project_files").remove([storagePath]);
      return null;
    }
  }

  function handleFileSelected(file: File) {
    songName = file.name.split(".").slice(0, -1).join(".");
    fileName = songName;
  }
  // Funkcja wywoływana po zakończeniu uploadu
  function handleFileUploaded(uploadedTrack: Track | null) {
    // Reset stanu
    songName = "";
    fileName = "";
    description = "";
    category = categories[0];

    if (uploadedTrack) {
      const redirectUrl = `/${project.slug}/${uploadedTrack.slug}`;
      goto(redirectUrl);
    }
  }
</script>

<FileUploadModal
  bind:isOpen
  title="Dodaj nowy utwór"
  acceptedFileTypes=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*"
  maxSizeInMB={50}
  {uploadFile}
  onFileUploaded={handleFileUploaded}
  onFileSelected={handleFileSelected}
>
  {#snippet additionalFields()}
    <div class="space-y-6 py-2">
      <!-- Nazwa utworu -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          <Info size={18} class="text-gray-400" />
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
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {category.id ===
                cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}"
                onclick={() => (category = cat)}
              >
                {cat.name}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Pole opisu -->
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          <User size={18} class="text-gray-400" />
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
