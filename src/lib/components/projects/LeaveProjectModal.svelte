<script lang="ts">
  import { goto } from "$app/navigation";
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Project } from "$lib/types/project";
  import toast, { Toaster } from "svelte-french-toast";
  import Button from "../ui/Button.svelte";
  let { isOpen = $bindable(), project }: { isOpen: boolean; project: Project } =
    $props();
  let isLoading = $state(false);

  async function leaveProject() {
    try {
      isLoading = true;

      const response = await fetch("/api/project-invites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Błąd podczas opuszczania projektu"
        );
      }

      const responseData = await response.json();

      // Wyświetl komunikat o powodzeniu
      toast.success(
        responseData.message || `Nie należysz do projektu ${project.name}`,
        {
          position: "bottom-right",
        }
      );

      // Przekieruj do strony głównej po opuszczeniu projektu
      goto("/");
    } catch (error) {
      console.error("Error leaving project:", error);

      // Wyświetl komunikat o błędzie
      toast.error(
        error instanceof Error
          ? error.message
          : "Nie udało się opuścić projektu",
        {
          position: "bottom-right",
        }
      );

      isLoading = false;
    }
  }
</script>

<Toaster />
<Modal bind:isOpen title="Opuść projekt" {isLoading}>
  <p class="text-gray-300 mb-6">
    Czy na pewno chcesz opuścić projekt
    <span class="font-semibold">{project.name}</span>?
  </p>
  <Button variant="danger" fullWidth onclick={leaveProject} disabled={isLoading}
    >Potwierdź</Button
  >
</Modal>
