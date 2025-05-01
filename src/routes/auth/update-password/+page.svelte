<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { getSupabaseContext } from "$lib/supabase-context";
  import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-svelte";
  import { Music } from "lucide-svelte";
  import { onMount } from "svelte";

  const supabase = getSupabaseContext();

  let newPassword = $state("");
  let confirmPassword = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  // Sprawdzamy, czy użytkownik jest w trybie resetowania hasła
  let isPasswordRecovery = $state(false);

  // onMount(() => {
  //   console.log("Strona resetowania hasła załadowana");

  //   // Sprawdź, czy w URL jest token resetowania hasła
  //   const url = new URL(window.location.href);
  //   const type = url.searchParams.get("type");
  //   const accessToken = url.searchParams.get("access_token");
  //   const refreshToken = url.searchParams.get("refresh_token");
  //   const errorCode = url.searchParams.get("error_code");
  //   const errorDescription = url.searchParams.get("error_description");

  //   console.log("Parametry URL:", {
  //     type,
  //     accessToken: !!accessToken,
  //     refreshToken: !!refreshToken,
  //     errorCode,
  //     errorDescription,
  //   });

  //   // Jeśli mamy błąd w URL, wyświetl go w konsoli
  //   if (errorCode || errorDescription) {
  //     console.error("Błąd w URL:", { errorCode, errorDescription });
  //     error = `Błąd: ${errorDescription || "Nieznany błąd"}`;
  //     // Nie ustawiamy isPasswordRecovery = true, więc zostanie wyświetlony komunikat o nieprawidłowym linku
  //   }

  //   // Jeśli mamy token w URL, spróbuj ustawić sesję
  //   if (type === "recovery" && accessToken && refreshToken) {
  //     // Używamy IIFE (Immediately Invoked Function Expression) aby użyć await
  //     (async () => {
  //       try {
  //         console.log("Próba ustawienia sesji z tokenami z URL");
  //         const { error: sessionError } = await supabase.auth.setSession({
  //           access_token: accessToken,
  //           refresh_token: refreshToken,
  //         });

  //         if (sessionError) {
  //           console.error("Błąd podczas ustawiania sesji:", sessionError);
  //           error = `Błąd podczas ustawiania sesji: ${sessionError.message}`;
  //         } else {
  //           console.log("Sesja ustawiona pomyślnie");
  //           isPasswordRecovery = true;
  //         }
  //       } catch (err) {
  //         console.error("Błąd podczas przetwarzania tokenów:", err);
  //         error =
  //           err instanceof Error
  //             ? err.message
  //             : "Wystąpił błąd podczas przetwarzania tokenów";
  //       }
  //     })();
  //   }

  //   // Nasłuchuj na zdarzenie zmiany stanu uwierzytelniania
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((event, session) => {
  //     console.log("Auth event:", event);

  //     if (event === "PASSWORD_RECOVERY") {
  //       console.log("Wykryto zdarzenie PASSWORD_RECOVERY");
  //       isPasswordRecovery = true;
  //     } else if (session) {
  //       console.log("Użytkownik zalogowany:", session.user?.email);
  //       isPasswordRecovery = true;
  //     } else if (!isPasswordRecovery) {
  //       // Jeśli użytkownik nie jest zalogowany i nie jest w trybie resetowania hasła,
  //       // przekieruj go na stronę główną
  //       console.log(
  //         "Brak sesji i nie jesteśmy w trybie resetowania hasła, przekierowuję na stronę główną"
  //       );
  //       goto("/");
  //     }
  //   });

  //   // Anuluj subskrypcję przy odmontowaniu komponentu
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // });

  async function handleUpdatePassword() {
    if (newPassword !== confirmPassword) {
      error = "Hasła nie są identyczne";
      return;
    }

    if (newPassword.length < 6) {
      error = "Hasło musi mieć co najmniej 6 znaków";
      return;
    }

    loading = true;
    error = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      success = true;

      // Po 3 sekundach przekieruj na stronę główną
      setTimeout(() => {
        goto("/");
      }, 3000);
    } catch (err) {
      console.error("Error updating password:", err);
      error =
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas aktualizacji hasła";
    } finally {
      loading = false;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }
</script>

<div class="fixed inset-0 flex flex-col md:flex-row h-screen">
  <!-- Lewa strona - niebieskie tło (ukryta na mobilnych) -->
  <div
    class="hidden md:flex md:w-1/2 lg:w-1/2 bg-[#273486] p-6 md:p-10 lg:p-16 flex-col"
  >
    <div class="flex items-center mb-8 md:mb-12 lg:mb-16">
      <Music class="text-white mr-2" size={28} />
      <h1 class="text-2xl font-bold text-white">BandSpace</h1>
    </div>

    <div class="flex-grow">
      <h2
        class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4"
      >
        Aktualizacja hasła
      </h2>
      <p class="text-white/90 mb-6 md:mb-8 lg:mb-12 text-sm md:text-base">
        Ustaw nowe hasło do swojego konta BandSpace.
      </p>
    </div>

    <div class="mt-auto">
      <p class="text-white/70 text-xs md:text-sm">
        © 2025 BandSpace. Wszelkie prawa zastrzeżone.
      </p>
    </div>
  </div>

  <!-- Logo na mobilnych urządzeniach (widoczne tylko na małych ekranach) -->
  <div class="flex md:hidden bg-[#273486] p-6 items-center">
    <Music class="text-white mr-2" size={24} />
    <h1 class="text-xl font-bold text-white">BandSpace</h1>
  </div>

  <!-- Prawa strona - ciemne tło -->
  <div
    class="flex-1 md:w-1/2 bg-gray-900 p-6 md:p-10 lg:p-16 flex items-center justify-center overflow-y-auto"
  >
    <div class="w-full max-w-md">
      {#if !isPasswordRecovery && !success}
        <div class="text-center">
          <h2 class="text-2xl font-bold text-white mb-4">Nieprawidłowy link</h2>
          <p class="text-gray-400 mb-6">
            Ten link do resetowania hasła jest nieprawidłowy lub wygasł. Linki
            do resetowania hasła są ważne tylko przez ograniczony czas. Spróbuj
            zresetować hasło ponownie, klikając "Zapomniałeś hasła?" na stronie
            logowania.
          </p>
          {#if error}
            <div
              class="p-3 mb-6 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
            >
              {error}
            </div>
          {/if}
          <Button onclick={() => goto("/")} primary
            >Wróć do strony głównej</Button
          >
        </div>
      {:else if success}
        <div class="text-center">
          <div
            class="p-4 mb-6 bg-green-500/20 border border-green-500/50 rounded text-green-400"
          >
            Hasło zostało pomyślnie zaktualizowane. Za chwilę zostaniesz
            przekierowany na stronę logowania.
          </div>
          <Button onclick={() => goto("/")} primary
            >Wróć do strony głównej</Button
          >
        </div>
      {:else}
        <h2 class="text-2xl font-bold text-white mb-2">Ustaw nowe hasło</h2>
        <p class="text-gray-400 mb-6">Wprowadź nowe hasło dla swojego konta.</p>

        {#if error}
          <div
            class="p-3 mb-6 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
          >
            {error}
          </div>
        {/if}

        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleUpdatePassword();
          }}
          class="space-y-4"
        >
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            name="new-password"
            bind:value={newPassword}
            required
            label="Nowe hasło"
            placeholder="Wprowadź nowe hasło"
            className="bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-500"
          >
            {#snippet prefix()}
              <IconLock class="h-5 w-5 text-gray-500" />
            {/snippet}
            {#snippet suffix()}
              <button
                type="button"
                class="text-gray-500 hover:text-gray-300 transition-colors"
                onclick={togglePasswordVisibility}
              >
                {#if showPassword}
                  <IconEyeOff class="h-5 w-5" />
                {:else}
                  <IconEye class="h-5 w-5" />
                {/if}
              </button>
            {/snippet}
          </Input>

          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirm-password"
            bind:value={confirmPassword}
            required
            label="Potwierdź hasło"
            placeholder="Potwierdź nowe hasło"
            className="bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-500"
          >
            {#snippet prefix()}
              <IconLock class="h-5 w-5 text-gray-500" />
            {/snippet}
            {#snippet suffix()}
              <button
                type="button"
                class="text-gray-500 hover:text-gray-300 transition-colors"
                onclick={toggleConfirmPasswordVisibility}
              >
                {#if showConfirmPassword}
                  <IconEyeOff class="h-5 w-5" />
                {:else}
                  <IconEye class="h-5 w-5" />
                {/if}
              </button>
            {/snippet}
          </Input>

          <Button type="submit" primary fullWidth disabled={loading}>
            {loading ? "Aktualizowanie..." : "Zaktualizuj hasło"}
          </Button>
        </form>
      {/if}
    </div>
  </div>
</div>
