<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Project } from "$lib/types/project";
  import toast, { Toaster } from "svelte-french-toast";
  let { isOpen = $bindable(), project }: { isOpen: boolean; project: Project } =
    $props();
  let isLoading = $state(false);
</script>

<Modal bind:isOpen title="Usuń projekt" {isLoading}>
  <p class="text-gray-300 mb-6">
    Czy na pewno chcesz usunąć projekt
    <span class="font-semibold">{project.name}</span>? Tej czynności nie można
    cofnąć. Wszystkie pliki projektu i dane zostaną trwale usunięte.
  </p>
  <form
    action="?/deleteProject"
    method="POST"
    use:enhance={() => {
      isLoading = true;
      return async ({ result, update }) => {
        if (result.type === "error") {
          toast.error(
            result.error?.message || "Wystąpił błąd podczas usuwania projektu",
            {
              position: "bottom-right",
            }
          );
          isLoading = false;
        }

        update();
      };
    }}
  >
    <input type="hidden" name="id" value={project.id} />
    <input type="hidden" name="slug" value={project.slug} />
    <Button
      type="submit"
      variant="danger"
      disabled={isLoading}
      {isLoading}
      fullWidth
    >
      Potwierdź
    </Button>
  </form>
</Modal>
