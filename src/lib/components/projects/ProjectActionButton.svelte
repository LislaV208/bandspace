<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    icon,
    onclick,
    class: className = "",
    children,
    ...props
  }: {
    icon: any;
    onclick: () => void;
    class?: string;
    children?: Snippet;
    [props: string]: any;
  } = $props();

  const IconComponent = $derived(icon);
</script>

<button
  {onclick}
  class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors text-sm {className}"
  {...props}
>
  {#if IconComponent}
    <IconComponent size={16} />
  {/if}
  {@render children?.()}
</button>
