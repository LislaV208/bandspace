<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import type { Track } from "$lib/types/track";

  let {
    isOpen = $bindable(),
    track,
    onClose,
  }: { isOpen: boolean; track: Track | null; onClose: () => void } = $props();

  let isLoading = $state(false);
</script>

<Modal bind:isOpen title="Usuń utwór" {isLoading}>
  <p class="text-gray-300 mb-6">
    Czy na pewno chcesz usunąć utwór
    <span class="font-semibold">{track?.name}</span>? Tej czynności nie można
    cofnąć. Wszystkie pliki utworu zostaną trwale usunięte.
  </p>
  <form
    action="?/deleteTrack"
    method="POST"
    use:enhance={() => {
      isLoading = true;
      return async ({ result, update }) => {
        if (result.type === "error") {
          toast.error(
            result.error?.message || "Wystąpił błąd podczas usuwania utworu"
          );
          isLoading = false;
        } else {
          await update();
          onClose?.();
        }
      };
    }}
  >
    <input type="hidden" name="id" value={track!.id} />
    <input type="hidden" name="slug" value={track!.slug} />
    <Button
      type="submit"
      variant="danger"
      disabled={isLoading}
      {isLoading}
      fullWidth
    >
      Potwierdź
    </Button>
  </form>
</Modal>
