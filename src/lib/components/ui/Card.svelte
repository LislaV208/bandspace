<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    class: className,
    children,
    ...props
  }: { class?: string; children?: Snippet } = $props();
</script>

<div class="h-full text-left bg-gray-800 rounded-lg p-4 {className}" {...props}>
  {@render children?.()}
</div>
