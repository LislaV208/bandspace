<script lang="ts">
  import Toast from "./Toast.svelte";
  import { toastStore } from "./toastStore";
  import { fade } from "svelte/transition";

  // Automatycznie subskrybuj do store
  const toasts = $derived($toastStore);
</script>

<div class="fixed bottom-0 right-0 p-4 space-y-4 z-50">
  {#each toasts as toast (toast.id)}
    <div in:fade={{ duration: 200 }}>
      <Toast
        type={toast.type}
        message={toast.message}
        duration={toast.duration}
        onClose={() => toastStore.remove(toast.id)}
      />
    </div>
  {/each}
</div>
