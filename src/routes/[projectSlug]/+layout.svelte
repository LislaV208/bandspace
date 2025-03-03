<script lang="ts">
    import type { LayoutProps } from "./$types";

    let { children }: LayoutProps = $props();
</script>

<!-- <Breadcrumbs project={br.project} recording={br.recording} /> -->
{@render children?.()}
