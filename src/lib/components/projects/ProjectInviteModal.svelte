<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import type { Project } from "$lib/types/project";
  import { CheckIcon, Link2, Loader2 } from "lucide-svelte";

  let { isOpen = $bindable(), project }: { isOpen: boolean; project: Project } =
    $props();

  let inviteUrl = $state("");
  let isCopied = $state(false);

  $effect(() => {
    if (isOpen) {
      generateInviteLink();
    }
  });

  async function generateInviteLink() {
    try {
      inviteUrl = "";
      const response = await fetch("/api/project-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Błąd podczas generowania linku");
      }

      const inviteData = await response.json();
      inviteUrl = inviteData.invite_url;
      isCopied = false;
    } catch (error) {
      console.error("Error generating invite link:", error);
      toast.error("Nie udało się wygenerować linku zapraszającego");
    }
  }

  function copyInviteLink() {
    if (inviteUrl) {
      navigator.clipboard
        .writeText(inviteUrl)
        .then(() => {
          isCopied = true;
          toast.success("Link skopiowany do schowka", 3000);

          // Reset stanu po 3 sekundach
          setTimeout(() => {
            isCopied = false;
          }, 3000);
        })
        .catch(() => {
          toast.error("Nie udało się skopiować linku");
        });
    }
  }
</script>

<Modal title="Zaproś do projektu" bind:isOpen size="lg">
  <div class="space-y-4">
    <p class="text-gray-300">
      Skopiuj link zapraszający i udostępnij go osobom, które chcesz zaprosić do
      współpracy przy projekcie <span class="font-semibold">{project.name}</span
      >.
    </p>

    <div class="flex flex-row space-x-2 items-center">
      <Input
        type="text"
        readonly
        value={inviteUrl}
        className="focus:outline-none text-sm"
      />
      <button
        class="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
        title="Kopiuj link"
        disabled={!inviteUrl}
        onclick={copyInviteLink}
      >
        {#if !inviteUrl}
          <Loader2 class="animate-spin text-blue-400" size={20} />
        {:else if isCopied}
          <CheckIcon size={20} color="#42f554" />
        {:else}
          <Link2 size={20} />
        {/if}
      </button>
    </div>
    <div class="flex items-center justify-center text-sm mt-4">
      <span class="text-gray-400">Problem z linkiem?</span>
      <button
        onclick={generateInviteLink}
        class="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        Wygeneruj nowy
      </button>
    </div>
  </div>
</Modal>
