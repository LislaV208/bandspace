<script lang="ts">
  import { goto } from "$app/navigation";
  import { Music, Users } from "lucide-svelte";

  import CardButton from "$lib/components/ui/CardButton.svelte";
  import type { DashboardProject } from "./+page.server";

  const { project }: { project: DashboardProject } = $props();
</script>

<CardButton onclick={() => goto(`/${project.slug}`)}>
  <div class="flex justify-between items-start gap-3">
    <div class="flex items-center gap-3">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg"
      >
        {project.name.charAt(0).toUpperCase()}
      </div>

      <div class="flex flex-col">
        <div
          class="text-lg font-semibold group-hover:text-blue-400 transition-colors"
        >
          {project.name}
        </div>

        <div class="flex items-center gap-1 text-gray-400 text-sm">
          <Users size={16} />
          <span>
            Osoby w projekcie:
            <b>{project.members_count}</b>
          </span>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-4 mb-3 border-t border-gray-700"></div>
  <div class="text-sm">
    <div class="text-gray-300 font-medium mb-2">Ostatnie utwory:</div>
    <div class="flex flex-wrap gap-2">
      {#if project.recent_tracks && project.recent_tracks.length > 0}
        {#each project.recent_tracks as track}
          <div
            class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-700 border border-gray-600 text-gray-200 transition-colors hover:bg-gray-600 cursor-pointer"
          >
            <span class="text-xs flex items-center gap-1">
              <Music size={12} class="text-blue-300" />
              {track.name}
            </span>
          </div>
        {/each}
      {:else}
        <div class="text-gray-500 text-xs italic">
          Brak utworów w tym projekcie
        </div>
      {/if}
    </div>
  </div>
</CardButton>
