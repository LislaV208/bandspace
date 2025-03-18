<script lang="ts">
  let {
    value = $bindable(),
    className,
    ...props
  }: { value?: string; className?: string; [props: string]: any } = $props();
</script>

<input
  bind:value
  {...props}
  class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all {className}"
/>
