<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, slide } from "svelte/transition";

  let {
    triggerContent,
    staticContent,
    children,
  }: {
    triggerContent: Snippet<[() => void]>;
    staticContent?: Snippet;
    children: Snippet;
  } = $props();

  let isOpen = $state(false);
  let triggerButtonElement: HTMLElement | null = $state(null);
  let staticElement: HTMLElement | null = $state(null);

  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerButtonElement &&
        !triggerButtonElement.contains(event.target as Node) &&
        staticElement &&
        !staticElement.contains(event.target as Node)
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

<!-- <div class="relative"> -->
<div class="relative z-100">
  <div bind:this={triggerButtonElement}>
    {@render triggerContent(() => (isOpen = !isOpen))}
  </div>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-700 transition-all duration-200 ease-in-out animate-in fade-in-50 zoom-in-95"
      transition:slide={{ duration: 300 }}
    >
      <div transition:fade={{ duration: 300 }}>
        <div bind:this={staticElement}>
          {@render staticContent?.()}
        </div>
        {@render children()}
      </div>
    </div>
  {/if}
</div>
