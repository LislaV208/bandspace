<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import type { User } from "$lib/types/user";

  let { isOpen = $bindable(), user }: { isOpen: boolean; user: User } =
    $props();
  let userName = $state(user?.name || "");
  let isLoading = $state(false);

  async function updateProfile() {
    if (!userName.trim()) {
      toast.error("Nazwa nie może być pusta");
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

      await response.json();

      // Wyświetl powiadomienie o sukcesie
      toast.success("Zaktualizowano profil");

      // Zamknij modal i odśwież stronę
      isOpen = false;

      // Przeładowanie strony
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas aktualizacji profilu"
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<Modal bind:isOpen title="Edytuj profil">
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
</Modal>
