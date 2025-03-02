<script lang="ts">
    import Breadcrumbs, {
        type BreadcrumbsProps,
    } from "$lib/components/Breadcrumbs.svelte";
    import type { LayoutProps } from "./$types";

    let { data, children }: LayoutProps = $props();
    const br: BreadcrumbsProps = {
        project: data.project,
        recording: data.recording,
    };
</script>

<Breadcrumbs project={br.project} recording={br.recording} />
{@render children?.()}
