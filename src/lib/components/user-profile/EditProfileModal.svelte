<script lang="ts">
  import type { User } from "$lib/user.type";
  import toast, { Toaster } from "svelte-french-toast";
  import Button from "../ui/Button.svelte";
  import Input from "../ui/Input.svelte";
  import Modal from "../ui/Modal.svelte";

  let { isOpen = $bindable(), user }: { isOpen: boolean; user: User } =
    $props();
  let userName = $state(user?.name || "");
  let isLoading = $state(false);

  $inspect(isOpen);

  async function updateProfile() {
    if (!userName.trim()) {
      toast.error("Nazwa nie może być pusta", { position: "bottom-right" });
      return;
    }

    isLoading = true;

    try {
      const response = await fetch("/api/user-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Błąd podczas aktualizacji profilu"
        );
      }

      const updatedUser = await response.json();

      // Wyświetl powiadomienie o sukcesie
      toast.success("Zaktualizowano profil", { position: "bottom-right" });

      // Zamknij modal i odśwież stronę
      isOpen = false;

      // Przeładowanie strony
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas aktualizacji profilu",
        { position: "bottom-right" }
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<Toaster />

<Modal bind:isOpen title="Edytuj profil">
  <div class="space-y-6">
    <div>
      <label
        for="displayName"
        class="block text-sm font-medium text-gray-300 mb-1"
      >
        Nazwa użytkownika
      </label>
      <Input
        id="displayName"
        type="text"
        bind:value={userName}
        placeholder="Wprowadź swoją nazwę"
        disabled={isLoading}
      />
      <p class="text-xs text-gray-400 mt-1">
        Ta nazwa będzie widoczna dla innych użytkowników aplikacji.
      </p>
    </div>

    <div class="flex justify-end space-x-3 pt-4">
      <Button primary fullWidth {isLoading} onclick={updateProfile}
        >Zapisz zmiany</Button
      >
    </div>
  </div>
</Modal>
