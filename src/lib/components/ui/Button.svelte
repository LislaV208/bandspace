<script lang="ts">
  import { Loader2 } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let {
    variant = "normal",
    primary = false,
    icon,
    isLoading,
    fullWidth,
    class: className,
    children,
    ...props
  }: {
    variant?: "normal" | "accent" | "danger";
    primary?: boolean;
    icon?: any;
    isLoading?: boolean;
    fullWidth?: boolean;
    class?: string;
    children?: Snippet;
    [props: string]: any;
  } = $props();

  const IconComponent = $derived(icon);

  variant = primary ? "accent" : variant;

  let color =
    variant === "accent"
      ? "bg-blue-600 hover:bg-blue-500"
      : variant === "danger"
        ? "bg-red-600 hover:bg-red-500"
        : "bg-slate-800 hover:bg-slate-700";
</script>

<button
  class="w-full {fullWidth
    ? ''
    : 'sm:w-auto'} h-10 {color} px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors {className}"
  {...props}
>
  {#if isLoading}
    <Loader2 class="animate-spin" size={20} />
  {:else}
    {#if IconComponent}
      <IconComponent size={20} />
    {/if}
    {@render children?.()}
  {/if}
</button>
