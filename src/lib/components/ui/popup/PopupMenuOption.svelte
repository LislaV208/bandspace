<script lang="ts">
  let {
    text,
    icon,
    onclick,
    className,
  }: {
    text: string;
    icon: any;
    onclick: () => void;
    className?: string;
  } = $props();

  const IconComponent = $derived(icon);
</script>

<button class="w-full" {onclick}>
  <div
    class="text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors text-gray-300 flex items-center whitespace-nowrap {className}"
  >
    <div class="mr-2 text-gray-400">
      <IconComponent size={16} />
    </div>
    {text}
  </div>
</button>
