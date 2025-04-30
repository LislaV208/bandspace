<script lang="ts">
  import { XIcon } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly, scale } from "svelte/transition";

  let {
    isOpen = $bindable(),
    title,
    isLoading,
    size = "md",
    onClose,
    children,
  }: {
    isOpen?: boolean;
    title?: string;
    isLoading?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    onClose?: () => void;
    children?: Snippet;
  } = $props();

  // Mapowanie rozmiaru na klasy szerokości
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // Blokowanie przewijania strony, gdy modal jest otwarty
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  });

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

  function handleBackdropClick(event: MouseEvent): void {
    if (isLoading) return;

    // Zamknij modal tylko jeśli kliknięto bezpośrednio w tło
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent): void {
    if (isLoading) return;

    if (event.key === "Enter" || event.key === " ") {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[100] bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
    role="presentation"
    tabindex="-1"
    transition:fade={{ duration: 200, easing: cubicOut }}
  ></div>

  <!-- Modal -->
  <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <div
      class="w-full {sizeClasses[
        size
      ]} bg-gray-900 border border-gray-800 rounded-lg shadow-xl transform transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      in:scale={{
        start: 0.95,
        duration: 200,
        opacity: 0,
        easing: cubicOut,
      }}
      out:fly={{
        y: 20,
        duration: 200,
        opacity: 0,
        easing: cubicOut,
      }}
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-800"
      >
        <h3 id="modal-title" class="text-lg font-medium text-white">{title}</h3>
        <button
          type="button"
          class="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          onclick={closeModal}
          aria-label="Zamknij"
        >
          <XIcon size={20} />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
