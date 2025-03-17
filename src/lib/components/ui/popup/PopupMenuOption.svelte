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
    class=" text-left px-4 py-3 text-sm hover:bg-gray-700/80 transition-all duration-200 ease-in-out text-gray-100 flex items-center whitespace-nowrap {className}"
  >
    <div class="mr-3">
      <IconComponent size={16} />
    </div>
    {text}
  </div>
</button>
