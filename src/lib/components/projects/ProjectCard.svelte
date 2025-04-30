<script lang="ts">
  import { goto } from "$app/navigation";
  import type { DashboardProject } from "$lib/types/project";
  import type { User } from "$lib/types/user";
  import { Music } from "lucide-svelte";

  const { project }: { project: DashboardProject } = $props();

  // Formatowanie daty utworzenia
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "dzisiaj";
    } else if (diffDays === 1) {
      return "wczoraj";
    } else if (diffDays < 30) {
      return `${diffDays}d temu`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}m temu`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}r temu`;
    }
  };

  const createdDate = formatDate(project.created_at);
</script>

<button onclick={() => goto(`/${project.slug}`)} class="w-full h-full group">
  <div
    class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-200 cursor-pointer h-full"
  >
    <!-- Górna sekcja - niebieskie tło z ikoną muzyki -->
    <div
      class="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex items-center justify-center"
    >
      <Music
        size={48}
        class="text-blue-400 opacity-80 transition-transform duration-200 group-hover:scale-110"
      />
    </div>

    <!-- Dolna sekcja - ciemne tło z informacjami o projekcie -->
    <div class="p-4 text-left">
      <h3
        class="text-lg font-medium text-white group-hover:text-blue-400 transition-colors"
      >
        {project.name}
      </h3>
      <p class="text-sm text-gray-400 mt-1">
        Utworzono {createdDate}
      </p>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex -space-x-2">
          {#if project.members && project.members.length > 0}
            {#each project.members.slice(0, 5) as member, i}
              <div
                class="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white overflow-hidden"
              >
                {#if member.avatar_url}
                  <img
                    src={member.avatar_url}
                    alt={member.name || member.email || `Użytkownik ${i + 1}`}
                    class="w-full h-full object-cover"
                  />
                {:else}
                  <div
                    class="w-full h-full bg-blue-600 flex items-center justify-center"
                  >
                    {member.name
                      ? member.name.charAt(0).toUpperCase()
                      : member.email
                        ? member.email.charAt(0).toUpperCase()
                        : `${i + 1}`}
                  </div>
                {/if}
              </div>
            {/each}
            {#if project.members_count > 5}
              <div
                class="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-white"
              >
                +{project.members_count - 5}
              </div>
            {/if}
          {/if}
        </div>
        <div
          class="bg-blue-600/20 rounded-full px-2.5 py-1 text-xs text-blue-400"
        >
          {project.members_count}
          {project.members_count === 1 ? "członek" : "członków"}
        </div>
      </div>
    </div>
  </div>
</button>
