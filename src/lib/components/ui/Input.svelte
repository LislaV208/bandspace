<script lang="ts">
  import { onMount } from "svelte";

  let {
    value = $bindable(),
    label,
    error,
    className,
    autoFocus = false,
    ...props
  }: {
    value?: string;
    label?: string;
    error?: string;
    className?: string;
    autoFocus?: boolean;
    [props: string]: any;
  } = $props();

  let inputElement: HTMLInputElement;

  onMount(() => {
    if (autoFocus && inputElement) {
      inputElement.focus();
    }
  });
</script>

<div class="w-full">
  {#if label}
    <label for={props.id} class="block text-sm font-medium text-gray-300 mb-1"
      >{label}</label
    >
  {/if}
  <input
    bind:value
    bind:this={inputElement}
    {...props}
    class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all {error
      ? 'border border-red-500'
      : ''} {className}"
  />
  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {/if}
</div>
