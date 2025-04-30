<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { User } from "$lib/types/user";

  let {
    isOpen = $bindable(),
    projectUsers,
  }: { isOpen: boolean; projectUsers: User[] } = $props();
</script>

<Modal bind:isOpen title="Członkowie projektu">
  <div class="space-y-4 max-h-96 overflow-y-scroll pr-2">
    <ul class="space-y-3">
      {#each projectUsers as projectUser}
        <li
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
          >
            {#if projectUser.avatar_url}
              <img
                src={projectUser.avatar_url}
                alt={projectUser.name || projectUser.email}
                class="h-full w-full object-cover"
                aria-label="Obrazek użytkownika"
              />
            {:else}
              {(projectUser.name || projectUser.email || "?")[0].toUpperCase()}
            {/if}
          </div>
          <div class="overflow-hidden">
            <div class="font-medium truncate">
              {projectUser.name || "Bez nazwy"}
            </div>
            <div class="text-sm text-gray-400 truncate">
              {projectUser.email}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</Modal>
