<script lang="ts">
  import { enhance } from "$app/forms";
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

  function handleSubmit(event: SubmitEvent) {
    if (!validateForm()) {
      event.preventDefault();
      return;
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
  <form
    action="?/updateProject"
    method="POST"
    onsubmit={handleSubmit}
    use:enhance={() => {
      isLoading = true;
      return async ({ result, update }) => {
        if (result.type === "error") {
          toast.error(
            result.error?.message || "Wystąpił błąd podczas aktualizacji projektu"
          );
          isLoading = false;
        } else {
          await update();
          toast.success("Nazwa projektu została zaktualizowana");
          isOpen = false;
          reset();
        }
      };
    }}
  >
    <input type="hidden" name="id" value={project.id} />
    <input type="hidden" name="slug" value={project.slug} />
    
    <Input
      type="text"
      name="name"
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
        type="submit"
        class="disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!projectName.trim() || projectName.trim() === project.name || isLoading}
      >
        Zapisz zmiany
      </Button>
    </div>
  </form>
</Modal>
