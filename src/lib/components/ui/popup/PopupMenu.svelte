<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, slide } from "svelte/transition";

  let {
    triggerContent,
    children,
  }: { triggerContent: Snippet; children: Snippet } = $props();

  let isOpen = $state(false);
  let triggerButtonElement: HTMLElement | null = $state(null);
  let popupElement: HTMLElement | null = $state(null);

  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerButtonElement &&
        !triggerButtonElement.contains(event.target as Node)
        // popupElement &&
        // !popupElement.contains(event.target as Node)
      ) {
        isOpen = false;
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div class="relative">
  <div
    bind:this={triggerButtonElement}
    onclick={() => (isOpen = !isOpen)}
    onkeydown={(e: KeyboardEvent) => e.key === "Enter" && (isOpen = !isOpen)}
    role="button"
    tabindex="0"
  >
    {@render triggerContent()}
  </div>
  {#if isOpen}
    <div
      bind:this={popupElement}
      class="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-600/50 transition-all duration-200 ease-in-out items-center"
      transition:slide={{ duration: 300 }}
    >
      <div transition:fade={{ duration: 300 }}>
        {@render children()}
      </div>
    </div>
  {/if}
</div>
