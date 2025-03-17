<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { ListMusic, Plus } from "lucide-svelte";
  import { fade } from "svelte/transition";

  const { onAddTrack }: { onAddTrack: () => void } = $props();
</script>

<div
  class="w-full flex flex-col items-center justify-center py-12 sm:py-16 space-y-6"
  transition:fade
>
  <div class="text-gray-600">
    <ListMusic size={100} />
  </div>
  <div class="space-y-2 text-center px-4">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-200">Brak utworów</h3>
    <p class="text-gray-400">Dodaj utwór do swojego projektu</p>
  </div>
  <Button primary onclick={onAddTrack}>
    <Plus size={20} />
    Dodaj utwór
  </Button>
</div>
