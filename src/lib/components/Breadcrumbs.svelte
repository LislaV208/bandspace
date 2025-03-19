<script lang="ts">
  import { ChevronRight } from "lucide-svelte";

  export interface BreadcrumbsProps {
    project: Breadcrumb;
    track?: Breadcrumb | null;
  }
  interface Breadcrumb {
    id: number | null;
    name: string | null;
    slug: string | null;
  }

  const { project, track }: BreadcrumbsProps = $props();
</script>

<nav class="flex flex-wrap items-center gap-x-2 gap-y-1">
  <!-- Wersja mobilna - pokazuje tylko ostatni element -->
  <div class="lg:hidden w-full flex items-center gap-x-2">
    <a
      href={track?.slug ? `/${project.slug}/${track.slug}` : `/${project.slug}`}
      class="text-xl font-medium text-white flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mr-1"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {track?.name || project.name}
    </a>
  </div>

  <!-- Wersja desktopowa - pełna ścieżka -->
  <div class="hidden lg:flex items-center space-x-2">
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
    {#if track?.slug}
      <ChevronRight class="w-5 h-5 text-gray-500" />
      <a
        href={`/${project.slug}/${track.slug}`}
        class="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300"
      >
        {track.name}
      </a>
    {/if}
  </div>
</nav>
