<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { Plus } from "lucide-svelte";
  import { fade } from "svelte/transition";

  let { onCreateProject }: { onCreateProject: () => void } = $props();
</script>

<div
  class="w-full flex flex-col items-center justify-center py-16 sm:py-24 space-y-10"
  transition:fade={{ duration: 300 }}
>
  <div
    class="w-36 h-36 sm:w-56 sm:h-56 text-blue-500/40 flex items-center justify-center"
  >
    <svg
      class="w-full h-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
  <div class="space-y-4 text-center px-4">
    <h3 class="text-2xl sm:text-3xl font-semibold text-white">
      Witaj w BandSpace
    </h3>
    <p class="text-gray-400 max-w-md text-base sm:text-lg">
      Utwórz swój pierwszy projekt muzyczny i zacznij współpracę z innymi
      muzykami. Zarządzaj utworami, udostępniaj pliki i komunikuj się z
      zespołem.
    </p>
  </div>
  <Button
    primary
    onclick={onCreateProject}
    class="w-full sm:w-auto px-6 py-2.5 text-base"
  >
    <Plus size={20} />
    <span>Utwórz pierwszy projekt</span>
  </Button>
</div>
