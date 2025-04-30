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

<div>
  <!-- Wersja mobilna - pokazuje tylko ostatni element -->
  <div class="md:hidden w-full flex items-center gap-x-2 mb-2">
    <a
      href="/dashboard"
      class="text-gray-400 hover:text-white transition-colors flex items-center"
      aria-label="Powrót do listy projektów"
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
    </a>

    {#if track?.slug}
      <a
        href={`/${project.slug}`}
        class="text-gray-400 hover:text-white transition-colors"
      >
        {project.name}
      </a>
      <ChevronRight size={16} class="text-gray-500" />
      <span class="text-lg font-medium text-white">{track.name}</span>
    {:else}
      <span class="text-lg font-medium text-white">{project.name}</span>
    {/if}
  </div>

  <!-- Wersja desktopowa - pełna ścieżka -->
  <div class="hidden md:block">
    <div class="flex items-center text-lg text-gray-400 mb-1">
      <a href="/dashboard" class="hover:text-white transition-colors">
        Projekty
      </a>
      <ChevronRight size={16} class="mx-1" />

      {#if track?.slug}
        <!-- Jeśli jesteśmy na stronie utworu, nazwa projektu jest tylko linkiem -->
        <a href={`/${project.slug}`} class="hover:text-white transition-colors">
          {project.name}
        </a>
        <ChevronRight size={16} class="mx-1" />
        <!-- Nazwa utworu jest aktualną częścią -->
        <span class="text-white">{track.name}</span>
      {:else}
        <!-- Jeśli jesteśmy na stronie projektu, nazwa projektu jest aktualną częścią -->
        <span class="text-white">{project.name}</span>
      {/if}
    </div>
  </div>
</div>
