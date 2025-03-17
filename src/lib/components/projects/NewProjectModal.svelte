<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import toast, { Toaster } from "svelte-french-toast";

  let { isOpen = $bindable() } = $props();

  let newProjectName = $state("");
  let isLoading = $state(false);

  function reset() {
    newProjectName = "";
    isLoading = false;
  }
</script>

<Toaster />
<Modal bind:isOpen title="Nowy projekt" {isLoading} onClose={() => reset()}>
  <form
    action="?/create"
    method="POST"
    class="space-y-4"
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
      bind:value={newProjectName}
      placeholder="Nazwa projektu"
    />
    <div class="h-1"></div>
    <Button
      primary
      {isLoading}
      fullWidth
      type="submit"
      class="disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!newProjectName.trim() || isLoading}
    >
      Utwórz
    </Button>
  </form>
</Modal>
