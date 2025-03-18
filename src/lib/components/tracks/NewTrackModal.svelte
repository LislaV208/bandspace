<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { getSupabaseContext } from "$lib/supabase-context";
  import type { Project } from "$lib/types/project";
  import { FileMusic, Loader2, Plus } from "lucide-svelte";
  import { getContext } from "svelte";
  import toast from "svelte-french-toast";
  import Button from "../ui/Button.svelte";
  import Input from "../ui/Input.svelte";

  let { isOpen = $bindable(), project }: { isOpen: boolean; project: Project } =
    $props();

  let selectedFile = $state<File | null>(null);
  let songName = $state("");
  let isUploading = $state(false);

  const supabase = getSupabaseContext();

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith("audio/")) {
        selectedFile = file;
        songName = file.name.split(".").slice(0, -1).join(".");
        console.log("songName:", songName);
      } else {
        toast.error("Wybierz plik audio (MP3, WAV, itp.)", {
          position: "bottom-right",
        });
        input.value = "";
      }
    }
  }

  async function uploadFile(file: File) {
    // Sanitize the file name for storage
    const storageFileName = file.name
      .replace(/\.[^.]+$/, "") // Remove file extension
      .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsupported chars with underscore
      .replace(/\s+/g, "-") // Replace spaces with underscore
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

<Modal
  bind:isOpen
  title="Dodaj utwór"
  isLoading={isUploading}
  hideTitle={isUploading}
>
  {#if isUploading}
    <div class="flex flex-col items-center justify-center">
      <Loader2 class="animate-spin mb-2" size={30} />
      <span class="text-sm text-gray-400">Trwa przesyłanie pliku...</span>
      <p class="text-xs text-gray-500 mt-0.5">Prosimy nie odświeżać strony</p>
    </div>
  {:else}
    <input
      type="file"
      id="audio-file"
      name="file"
      accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/mp3,audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/flac"
      class="hidden"
      onchange={handleFileSelect}
    />
    <form
      action="?/create"
      method="POST"
      class="space-y-6"
      use:enhance={async ({ formElement, formData }) => {
        isUploading = true;
        const file = selectedFile;
        if (!file) {
          isUploading = false;
          songName = "";
          selectedFile = null;
          formElement.reset();
          toast.error("No file selected", { position: "bottom-right" });
          return;
        }

        const { storagePath, storageError } = await uploadFile(file);

        if (storageError) {
          isUploading = false;
          songName = "";
          selectedFile = null;
          formElement.reset();
          toast.error(storageError.message, { position: "bottom-right" });
          return;
        }

        formData.append("storage_file_path", storagePath);

        return async ({ result }) => {
          console.log("result:", result);

          if (result.type === "error") {
            await supabase.storage.from("project_files").remove([storagePath]);

            isUploading = false;
            songName = "";
            selectedFile = null;
            formElement.reset();
            toast.error(result.error.message, { position: "bottom-right" });
          } else if (result.type === "redirect") {
            goto(result.location);
          }
        };
      }}
    >
      <input type="hidden" name="project_id" value={project.id} />
      <input type="hidden" name="file_name" value={selectedFile?.name} />

      <!-- Drag & Drop Area -->
      <div
        class="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors"
      >
        <div class="text-gray-400 mb-4">
          {selectedFile
            ? selectedFile.name
            : "Kliknij poniższy przycisk lub przeciągnij plik"}
        </div>
        <button
          type="button"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
          onclick={() => document.getElementById("audio-file")?.click()}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("audio-file")?.click();
            }
          }}
        >
          <FileMusic size={16} />
          {selectedFile ? "Zmień plik" : "Wybierz plik"}
        </button>
      </div>

      <Input
        label="Nazwa utworu"
        id="song-name"
        type="text"
        name="name"
        bind:value={songName}
      />

      <Button primary fullWidth type="submit" disabled={!selectedFile}>
        Dodaj
      </Button>
    </form>
  {/if}
</Modal>
