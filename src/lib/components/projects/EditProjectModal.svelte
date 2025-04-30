<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import type { Project } from "$lib/types/project";

  let { isOpen = $bindable(), project }: { isOpen: boolean; project: Project } =
    $props();

  let projectName = $state("");
  let isLoading = $state(false);
  let error = $state("");

  $effect(() => {
    if (isOpen && project) {
      projectName = project.name;
    }
  });

  function reset() {
    projectName = project.name;
    isLoading = false;
    error = "";
  }

  function validateForm() {
    if (!projectName.trim()) {
      error = "Nazwa projektu jest wymagana";
      return false;
    }

    if (projectName.trim() === project.name) {
      error = "Podaj inną nazwę projektu";
      return false;
    }

    error = "";
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    isLoading = true;

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName.trim(),
          oldSlug: project.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Wystąpił błąd podczas aktualizacji projektu"
        );
      }

      toast.success("Nazwa projektu została zaktualizowana");

      // Jeśli slug się zmienił, przekieruj na nowy URL
      if (data.redirect) {
        goto(data.redirect);
      }

      isOpen = false;
      reset();
    } catch (err) {
      console.error("Błąd podczas aktualizacji projektu:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas aktualizacji projektu"
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<Modal
  bind:isOpen
  title="Edytuj nazwę projektu"
  {isLoading}
  size="sm"
  onClose={() => reset()}
>
  <div>
    <Input
      type="text"
      label="Nazwa projektu"
      bind:value={projectName}
      placeholder="Wprowadź nową nazwę projektu"
      autoFocus={true}
      {error}
      oninput={() => error && (error = "")}
    />

    <div class="flex justify-end space-x-3 mt-6">
      <Button
        variant="normal"
        type="button"
        onclick={() => {
          isOpen = false;
          reset();
        }}
        disabled={isLoading}
      >
        Anuluj
      </Button>
      <Button
        primary
        {isLoading}
        type="button"
        onclick={handleSubmit}
        class="disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!projectName.trim() ||
          projectName.trim() === project.name ||
          isLoading}
      >
        Zapisz zmiany
      </Button>
    </div>
  </div>
</Modal>
