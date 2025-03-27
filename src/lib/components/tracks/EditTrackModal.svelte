<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import type { Track } from "$lib/types/track";
    import toast, { Toaster } from "svelte-french-toast";

    let {
        isOpen = $bindable(),
        track,
        onClose,
    }: { isOpen: boolean; track: Track | null; onClose: () => void } = $props();

    let trackName = $state(track?.name || "");
    let isLoading = $state(false);

    // Aktualizuj trackName, gdy modal się otwiera
    $effect(() => {
        if (track) {
            trackName = track.name;
        }
    });

    async function handleSubmit() {
        // Walidacja
        if (!trackName.trim()) {
            toast.error("Nazwa utworu nie może być pusta", {
                position: "bottom-right",
            });
            return;
        }

        isLoading = true;

        const response = await fetch(`/api/tracks/${track?.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: trackName,
            }),
        });

        if (response.ok) {
            toast.success("Zapisano zmiany", {
                position: "bottom-right",
            });
            onClose();
        } else {
            toast.error("Wystąpił błąd podczas zapisywania zmian", {
                position: "bottom-right",
            });
        }
        isLoading = false;
    }
</script>

<Toaster />
<Modal bind:isOpen title="Edytuj utwór" {isLoading}>
    <div class="space-y-6">
        <Input
            label="Nazwa utworu"
            id="track-name"
            type="text"
            name="track_name"
            bind:value={trackName}
            required
        />

        <div class="flex gap-4 mt-6">
            <Button
                type="button"
                onclick={handleSubmit}
                disabled={isLoading}
                {isLoading}
                fullWidth
            >
                Zapisz
            </Button>
        </div>
    </div>
</Modal>
