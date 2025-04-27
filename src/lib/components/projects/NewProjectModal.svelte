<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import toast, { Toaster } from "svelte-french-toast";

  let { isOpen = $bindable() } = $props();

  let newProjectName = $state("");
  let isLoading = $state(false);
  let error = $state("");

  function reset() {
    newProjectName = "";
    isLoading = false;
    error = "";
  }

  function validateForm() {
    if (!newProjectName.trim()) {
      error = "Nazwa projektu jest wymagana";
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

<Toaster />
<Modal
  bind:isOpen
  title="Nowy projekt"
  {isLoading}
  size="sm"
  onClose={() => reset()}
>
  <form
    action="?/create"
    method="POST"
    onsubmit={handleSubmit}
    use:enhance={() => {
      isLoading = true;
      return async ({ result, update }) => {
        console.log("result:", result);
        if (result.type === "error") {
          toast.error(result.error.message, {
            position: "bottom-right",
          });
          isLoading = false;
        } else {
          await update();
          isOpen = false;
          reset();
        }
      };
    }}
  >
    <Input
      type="text"
      name="name"
      label="Nazwa projektu"
      bind:value={newProjectName}
      placeholder="Wprowadź nazwę projektu"
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
        disabled={!newProjectName.trim() || isLoading}
      >
        Utwórz projekt
      </Button>
    </div>
  </form>
</Modal>
