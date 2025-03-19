<script lang="ts">
  import { HelpCircle } from "lucide-svelte";
  import { onMount } from "svelte";

  let {
    content,
    position = "bottom",
    width = "w-64",
  }: {
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    width?: string;
  } = $props();

  let isVisible = $state(false);
  let isMobileVisible = $state(false);
  let isMobile = $state(false);
  let tooltipRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  // Wykrywanie urządzenia mobilnego
  function detectMobile() {
    return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
  }

  onMount(() => {
    isMobile = detectMobile();
    
    // Nasłuchiwanie kliknięć poza tooltipem na urządzeniach mobilnych
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileVisible && 
          tooltipRef && 
          buttonRef && 
          !tooltipRef.contains(event.target as Node) && 
          !buttonRef.contains(event.target as Node)) {
        isMobileVisible = false;
      }
    };
    
    // Nasłuchiwanie klawisza Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isVisible || isMobileVisible)) {
        isVisible = false;
        isMobileVisible = false;
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  function toggleMobileVisibility(event: MouseEvent) {
    if (isMobile) {
      event.stopPropagation();
      isMobileVisible = !isMobileVisible;
    }
  }

  // Określenie pozycji tooltipa
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1",
  };
</script>

<div class="relative inline-flex items-center">
  <button
    bind:this={buttonRef}
    type="button"
    class="text-gray-400 hover:text-gray-200 transition-colors flex items-center justify-center h-5 w-5"
    onmouseenter={() => !isMobile && (isVisible = true)}
    onmouseleave={() => !isMobile && (isVisible = false)}
    onclick={toggleMobileVisibility}
    aria-label="Pokaż więcej informacji"
  >
    <HelpCircle size={16} />
  </button>
  
  {#if isVisible || isMobileVisible}
    <!-- Używamy elementu div tylko do wyświetlania treści, bez interaktywności -->
    <div 
      bind:this={tooltipRef}
      class="absolute z-50 {positionClasses[position]} p-2 bg-gray-900 text-gray-200 text-xs rounded-md shadow-lg {width} border border-gray-700"
      role="tooltip"
      aria-live="polite"
    >
      {content}
    </div>
  {/if}
</div>
