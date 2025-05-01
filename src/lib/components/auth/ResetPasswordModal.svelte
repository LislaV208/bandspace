<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { IconMail } from "@tabler/icons-svelte";

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let email = "";
  let loading = false;
  let error: string | null = null;
  let success = false;

  async function handleResetPassword() {
    if (!email) {
      error = "Adres email jest wymagany";
      return;
    }

    loading = true;
    error = null;
    success = false;

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        error = result.error;
        return;
      }

      success = true;
    } catch (err) {
      console.error("Reset password error:", err);
      error = "Wystąpił błąd podczas wysyłania linku resetującego hasło. Spróbuj ponownie.";
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    isOpen = false;
    // Reset state when modal is closed
    email = "";
    error = null;
    success = false;
    dispatch("close");
  }
</script>

<Modal bind:isOpen onClose={closeModal} title="Resetowanie hasła">
  <div class="space-y-4">
    {#if success}
      <div class="p-4 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-sm">
        Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę odbiorczą.
      </div>
    {:else}
      {#if error}
        <div class="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <p class="text-gray-400 text-sm">
        Podaj swój adres email, a wyślemy Ci link do zresetowania hasła.
      </p>

      <form on:submit|preventDefault={handleResetPassword} class="space-y-4">
        <Input
          id="reset-email"
          type="email"
          name="email"
          bind:value={email}
          required
          label="Email"
          placeholder="Wprowadź swój email"
          className="bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-500"
          autocomplete="email"
        >
          {#snippet prefix()}
            <IconMail class="h-5 w-5 text-gray-500" />
          {/snippet}
        </Input>

        <div class="flex justify-end space-x-3 pt-2">
          <Button onclick={closeModal} secondary>Anuluj</Button>
          <Button type="submit" primary disabled={loading}>
            {loading ? "Wysyłanie..." : "Wyślij link"}
          </Button>
        </div>
      </form>
    {/if}
  </div>
</Modal>
