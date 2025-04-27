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
  class="gap-3
        font-medium rounded-md transition-all duration-200 focus:outline-none flex items-center justify-center
        bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white
        text-xs px-3 py-1.5 {className}
      "
  {...props}
>
  {#if IconComponent}
    <IconComponent size={16} />
  {/if}
  {@render children?.()}
</button>
