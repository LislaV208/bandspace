<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { Plus } from "lucide-svelte";
  import { fade } from "svelte/transition";

  let { onCreateProject }: { onCreateProject: () => void } = $props();
</script>

<div
  class="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-8"
  transition:fade
>
  <div
    class="w-32 h-32 sm:w-48 sm:h-48 text-blue-400/50 flex items-center justify-center"
  >
    <svg
      class="w-full h-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
  <div class="space-y-3 text-center px-4">
    <h3 class="text-xl sm:text-2xl font-semibold text-white">Brak projektów</h3>
    <p class="text-gray-400 max-w-md">
      Utwórz swój pierwszy projekt muzyczny i zacznij współpracę z innymi
      muzykami.
    </p>
  </div>
  <Button primary onclick={onCreateProject}>
    <Plus size={20} />
    Utwórz projekt
  </Button>
</div>
