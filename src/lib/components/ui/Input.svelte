<script lang="ts">
  let {
    value = $bindable(),
    label,
    className,
    ...props
  }: {
    value?: string;
    label?: string;
    className?: string;
    [props: string]: any;
  } = $props();
</script>

<div class="w-full">
  {#if label}
    <label for={props.id} class="block text-sm font-medium text-gray-300 mb-1"
      >{label}</label
    >
  {/if}
  <input
    bind:value
    {...props}
    class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all {className}"
  />
</div>
