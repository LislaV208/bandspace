<script lang="ts">
  import { XIcon } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { fade, slide } from "svelte/transition";

  let {
    isOpen = $bindable(),
    title,
    isLoading,
    maxWidth = "max-w-md",
    onClose,
    children,
  }: {
    isOpen?: boolean;
    title?: string;
    isLoading?: boolean;
    maxWidth?: string;
    onClose?: () => void;
    children?: Snippet;
  } = $props();

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && isOpen) {
      closeModal();
    }
  }

  function closeModal(): void {
    if (isLoading) return;

    isOpen = false;
    onClose?.();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="z-1 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
    transition:fade
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full {maxWidth} relative"
      transition:slide
    >
      <div class="flex flex-row justify-between items-center mb-6">
        <h2 class="text-xl font-bold">{title}</h2>
        <button onclick={closeModal}>
          <XIcon />
        </button>
      </div>
      {@render children?.()}
    </div>
  </div>
{/if}
