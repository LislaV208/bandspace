<script lang="ts">
  let {
    text,
    icon,
    onclick,
  }: { text: string; icon: any; onclick: () => void } = $props();

  const IconComponent = $derived(icon);
</script>

<button class="w-full" {onclick}>
  <div
    class="text-left px-4 py-3 text-sm hover:bg-gray-700/80 transition-all duration-200 ease-in-out text-gray-100 hover:text-white flex items-center"
  >
    <div class="mr-3">
      <IconComponent size={16} />
    </div>
    {text}
  </div>
</button>
