<script lang="ts">
  import { ChevronRight } from "lucide-svelte";

  export interface BreadcrumbsProps {
    project: Breadcrumb;
    recording?: Breadcrumb | null;
  }
  interface Breadcrumb {
    id: number | null;
    name: string | null;
    slug: string | null;
  }

  const { project, recording }: BreadcrumbsProps = $props();
</script>

<nav class="flex items-center space-x-2 mb">
  <a
    href="/"
    class="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300"
  >
    Projekty
  </a>
  <ChevronRight class="w-5 h-5 text-gray-500" />
  <a
    href={`/${project.slug}`}
    class="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300"
  >
    {project.name}
  </a>
  {#if recording?.slug}
    <ChevronRight class="w-5 h-5 text-gray-500" />
    <a
      href={`/${project.slug}/${recording.slug}`}
      class="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300"
    >
      {recording.name}
    </a>
  {/if}
</nav>
