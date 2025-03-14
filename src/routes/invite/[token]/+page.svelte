<script lang="ts">
  import { enhance } from "$app/forms";

  const { data } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[70vh] px-4">
  <div
    class="bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 w-full max-w-md border border-gray-700/50"
  >
    <h1 class="text-2xl font-bold mb-4">Zaproszenie do projektu</h1>

    <p class="text-gray-300 mb-6">
      Zostałeś zaproszony do projektu <span class="font-semibold"
        >{data.project.name}</span
      >.
    </p>

    <form method="POST" action="?/accept" use:enhance>
      <button
        type="submit"
        class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center"
      >
        Dołącz do projektu
      </button>
    </form>
  </div>
</div>
