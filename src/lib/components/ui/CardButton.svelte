<script lang="ts">
  import type { Snippet } from "svelte";
  import Card from "./Card.svelte";

  let { children, ...props }: { children?: Snippet; [props: string]: any } =
    $props();
</script>

<button {...props}>
  <Card
    class="overflow-hidden hover:bg-gray-700/60 transition duration-200 hover:shadow-xl"
  >
    {@render children?.()}
  </Card>
</button>
