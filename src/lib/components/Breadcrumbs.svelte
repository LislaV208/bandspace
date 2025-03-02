<script lang="ts">
    import { page } from "$app/stores";
    import { ChevronRight } from "lucide-svelte";

    const segments = $derived(
        $page.url.pathname.split("/").filter((segment) => segment !== ""),
    );

    const currentSegment = $derived(segments[segments.length - 1]);

    $inspect(segments);
    $inspect(currentSegment);
</script>

{#if currentSegment}
    <nav class="flex items-center space-x-2 mb-8">
        <a
            href="/"
            class={`${!currentSegment ? "text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300" : "text-2xl text-gray-400 hover:text-gray-200 transition-colors"}`}
        >
            Projects
        </a>
        {#each segments as segment, index}
            <ChevronRight class="w-5 h-5 text-gray-500" />
            <a
                href={`/${segments.slice(0, index + 1).join("/")}`}
                class={`${segment === currentSegment ? "text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300" : "text-2xl text-gray-400 hover:text-gray-200 transition-colors"}`}
            >
                {segment}
            </a>
        {/each}
    </nav>
{/if}
