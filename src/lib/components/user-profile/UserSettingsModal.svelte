<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { toast } from "$lib/components/ui/toast";
  import type { User } from "$lib/types/user";
  import { Lock } from "lucide-svelte";

  let { isOpen = $bindable(), user }: { isOpen: boolean; user: User } = $props();

  // Stan formularza zmiany hasła
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  // Resetowanie formularza
  function resetForm() {
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    error = null;
    isLoading = false;
  }

  // Walidacja formularza
  function validateForm() {
    if (!currentPassword) {
      error = "Aktualne hasło jest wymagane";
      return false;
    }

    if (!newPassword) {
      error = "Nowe hasło jest wymagane";
      return false;
    }

    if (newPassword.length < 8) {
      error = "Nowe hasło musi mieć co najmniej 8 znaków";
      return false;
    }

    if (newPassword !== confirmPassword) {
      error = "Hasła nie są identyczne";
      return false;
    }

    error = null;
    return true;
  }

  // Zmiana hasła
  async function changePassword() {
    if (!validateForm()) return;

    try {
      isLoading = true;

      const response = await fetch("/api/user-settings/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Wystąpił błąd podczas zmiany hasła");
      }

      toast.success("Hasło zostało zmienione pomyślnie");
      resetForm();
      isOpen = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      console.error("Error changing password:", err);
    } finally {
      isLoading = false;
    }
  }

  // Resetowanie formularza przy otwarciu/zamknięciu modalu
  $effect(() => {
    if (!isOpen) {
      resetForm();
    }
  });
</script>

<Modal bind:isOpen title="Ustawienia konta" {isLoading} size="md">
  <div class="space-y-6">
    <!-- Sekcja zmiany hasła -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 mb-2">
        <Lock size={18} class="text-blue-500" />
        <h3 class="text-lg font-medium text-white">Zmiana hasła</h3>
      </div>
      
      <div class="space-y-4 bg-gray-800/50 p-4 rounded-lg">
        {#if error}
          <div class="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        {/if}
        
        <Input
          type="password"
          label="Aktualne hasło"
          bind:value={currentPassword}
          placeholder="Wprowadź aktualne hasło"
          disabled={isLoading}
        />
        
        <Input
          type="password"
          label="Nowe hasło"
          bind:value={newPassword}
          placeholder="Wprowadź nowe hasło"
          disabled={isLoading}
        />
        
        <Input
          type="password"
          label="Potwierdź nowe hasło"
          bind:value={confirmPassword}
          placeholder="Potwierdź nowe hasło"
          disabled={isLoading}
        />
        
        <div class="flex justify-end">
          <Button
            primary
            onclick={changePassword}
            disabled={isLoading}
            {isLoading}
          >
            Zmień hasło
          </Button>
        </div>
      </div>
    </div>
    
    <div class="border-t border-gray-700 pt-4">
      <Button
        variant="normal"
        onclick={() => (isOpen = false)}
        disabled={isLoading}
        fullWidth
      >
        Zamknij
      </Button>
    </div>
  </div>
</Modal>
