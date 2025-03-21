<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Snippet } from "svelte";

  let {
    isOpen = $bindable(),
    title = "Potwierdź akcję",
    buttonText = "Potwierdź",
    buttonVariant = "primary",
    onConfirm,
    onClose,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    buttonText?: string;
    buttonVariant?: "primary" | "accent" | "danger";
    onConfirm: () => Promise<void> | void;
    onClose?: () => void;
    children?: Snippet;
  } = $props();

  let isLoading = $state(false);

  async function handleConfirm(): Promise<void> {
    if (isLoading) return;

    isLoading = true;
    try {
      await onConfirm();
      isOpen = false;
    } catch (error) {
      console.error("Błąd podczas wykonywania akcji:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<Modal bind:isOpen {title} {isLoading} {onClose}>
  <div class="mb-6">
    {@render children?.()}
  </div>
  <Button
    type="button"
    variant={buttonVariant}
    disabled={isLoading}
    {isLoading}
    fullWidth
    onclick={handleConfirm}
  >
    {buttonText}
  </Button>
</Modal>
