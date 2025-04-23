<script lang="ts">
  import { enhance } from "$app/forms";
  import NewProjectModal from "$lib/components/projects/NewProjectModal.svelte";
  import NoProjectsView from "$lib/components/projects/NoProjectsView.svelte";
  import ProjectCard from "$lib/components/projects/ProjectCard.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import {
    IconLock,
    IconLogin,
    IconMail,
    IconPlus,
    IconUserPlus,
  } from "@tabler/icons-svelte";
  import BrandGoogle from "@tabler/icons-svelte/icons/brand-google";
  import BrandGoogleFilled from "@tabler/icons-svelte/icons/brand-google-filled";
  import { Music } from "lucide-svelte";
  import { onMount } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";

  // Konfiguracja animacji elementów
  const elementTransition = {
    duration: 300,
    easing: quintOut,
  };

  let { data, form } = $props();

  // Sprawdzamy, czy użytkownik jest zalogowany
  let isLoggedIn = $state(false);
  let projects = $state<any[]>([]);
  let hasProjects = $state(false);

  // Aktualizujemy stan na podstawie danych
  $effect(() => {
    isLoggedIn = !!data.session;
    projects = isLoggedIn ? data.data || [] : [];
    hasProjects = isLoggedIn && projects.length > 0;
  });

  // Dla zalogowanych użytkowników
  let isCreateProjectModalOpened = $state(false);

  // Dla niezalogowanych użytkowników
  let activeTab = $state("login"); // "login" lub "register"
  let loading = $state(false);

  // Pobieramy parametr redirect z URL (jeśli istnieje)
  let redirectParam = $state<string | null>(null);

  // Dane formularza
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");

  // Błędy
  let error = $state(form?.error || null);

  // Inicjalizacja parametru redirect po stronie klienta
  onMount(() => {
    if (typeof window !== "undefined") {
      redirectParam = new URL(window.location.href).searchParams.get(
        "redirect"
      );
    }
  });

  // Funkcja zapisująca docelowy URL do localStorage przed logowaniem przez Google
  function saveRedirectToLocalStorage() {
    if (redirectParam && typeof localStorage !== "undefined") {
      localStorage.setItem("redirectAfterLogin", redirectParam);
      console.log(
        "Zapisano URL do przekierowania w localStorage:",
        redirectParam
      );
    }
  }
</script>

{#if isLoggedIn}
  <!-- Widok dla zalogowanych użytkowników -->
  <div
    class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8"
  >
    <h1 class="text-2xl">Projekty</h1>
    {#if hasProjects}
      <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
        <Button onclick={() => (isCreateProjectModalOpened = true)} primary>
          <IconPlus size={20} />
          Nowy projekt
        </Button>
      </div>
    {/if}
  </div>

  <div class="container mx-auto">
    <div
      class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6 mx-auto"
    >
      {#each projects as project (project.id)}
        <ProjectCard {project} />
      {/each}

      {#if projects.length === 0}
        <NoProjectsView
          onCreateProject={() => (isCreateProjectModalOpened = true)}
        />
      {/if}
    </div>
  </div>

  <NewProjectModal bind:isOpen={isCreateProjectModalOpened} />
{:else}
  <!-- Widok dla niezalogowanych użytkowników -->
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
          Twórz muzykę razem, gdziekolwiek jesteś.
        </h2>
        <p class="text-white/90 mb-6 md:mb-8 lg:mb-12 text-sm md:text-base">
          Współpracuj nad utworami, udostępniaj pliki i twórz niesamowitą muzykę
          ze swoim zespołem — wszystko w jednym miejscu.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div class="bg-[#414791] p-4 md:p-6 rounded-lg">
            <h3 class="font-semibold text-white mb-2">Płynna współpraca</h3>
            <p class="text-xs md:text-sm text-white/80">
              Pracujcie razem w czasie rzeczywistym, bez względu na to, gdzie
              jesteście.
            </p>
          </div>
          <div class="bg-[#414791] p-4 md:p-6 rounded-lg">
            <h3 class="font-semibold text-white mb-2">
              Zorganizowany przepływ pracy
            </h3>
            <p class="text-xs md:text-sm text-white/80">
              Przechowuj wszystkie projekty i utwory w jednym miejscu.
            </p>
          </div>
          <div class="bg-[#414791] p-4 md:p-6 rounded-lg">
            <h3 class="font-semibold text-white mb-2">
              System informacji zwrotnej
            </h3>
            <p class="text-xs md:text-sm text-white/80">
              Komentuj utwory, aby zapewnić szczegółową informację zwrotną.
            </p>
          </div>
          <div class="bg-[#414791] p-4 md:p-6 rounded-lg">
            <h3 class="font-semibold text-white mb-2">
              Bezpieczne udostępnianie
            </h3>
            <p class="text-xs md:text-sm text-white/80">
              Kontroluj, kto ma dostęp do Twojej muzyki i plików.
            </p>
          </div>
        </div>
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
      <div class="w-full max-w-md relative min-h-[450px] md:min-h-[500px]">
        <div class="absolute inset-0">
          <!-- Nagłówek i podpis z animacją -->
          <div class="h-28 relative">
            {#if activeTab === "login"}
              <div
                class="absolute inset-0"
                in:fly={{
                  x: 20,
                  duration: elementTransition.duration,
                  delay: 50,
                }}
                out:fly={{ x: -20, duration: elementTransition.duration / 2 }}
              >
                <h2 class="text-2xl font-bold text-white mb-2">
                  Witaj z powrotem!
                </h2>
                <p class="text-gray-400">
                  Zaloguj się, aby kontynuować pracę nad swoimi projektami.
                </p>
              </div>
            {:else}
              <div
                class="absolute inset-0"
                in:fly={{
                  x: 20,
                  duration: elementTransition.duration,
                  delay: 50,
                }}
                out:fly={{ x: -20, duration: elementTransition.duration / 2 }}
              >
                <h2 class="text-2xl font-bold text-white mb-2">
                  Dołącz do BandSpace
                </h2>
                <p class="text-gray-400">
                  Utwórz konto, aby rozpocząć współpracę muzyczną.
                </p>
              </div>
            {/if}
          </div>

          <!-- Komunikat o błędzie -->
          {#if error}
            <div
              class="p-3 mb-6 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
            >
              {error}
            </div>
          {/if}

          <!-- Wspólny formularz z dynamiczną akcją -->
          <form
            method="POST"
            action={activeTab === "login" ? "?/login" : "?/register"}
            class="space-y-4 md:space-y-5 w-full"
            use:enhance={() => {
              loading = true;
              return async ({ update }) => {
                loading = false;
                await update();
              };
            }}
          >
            <!-- Pola formularza -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-400 mb-1"
                >Email</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <IconMail class="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  bind:value={email}
                  required
                  class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Wprowadź swój email"
                />
              </div>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-400 mb-1"
                >Hasło</label
              >
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <IconLock class="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  bind:value={password}
                  required
                  class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Wprowadź swoje hasło"
                />
              </div>
            </div>

            <!-- Kontener dla pola potwierdzenia hasła i przycisku -->
            <div
              class="relative"
              style="height: {activeTab === 'register'
                ? '140px'
                : '60px'}; transition: height {elementTransition.duration}ms {elementTransition.easing};"
            >
              <!-- Pole potwierdzenia hasła (tylko dla rejestracji) -->
              <div
                style="opacity: {activeTab === 'register'
                  ? '1'
                  : '0'}; transform: translateY({activeTab === 'register'
                  ? '0'
                  : '-10px'}); transition: opacity {elementTransition.duration}ms {elementTransition.easing}, transform {elementTransition.duration}ms {elementTransition.easing}; height: {activeTab ===
                'register'
                  ? 'auto'
                  : '0'}; overflow: hidden;"
              >
                <label
                  for="confirm-password"
                  class="block text-sm font-medium text-gray-400 mb-1"
                  >Potwierdź hasło</label
                >
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <IconLock class="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirm-password"
                    bind:value={confirmPassword}
                    required={activeTab === "register"}
                    disabled={activeTab !== "register"}
                    class="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Potwierdź hasło"
                  />
                </div>
              </div>

              <!-- Przycisk logowania/rejestracji z animacją -->
              <div
                class="w-full absolute"
                style="top: {activeTab === 'register'
                  ? '90px'
                  : '0'}; transition: top {elementTransition.duration}ms {elementTransition.easing};"
              >
                <button
                  type="submit"
                  disabled={loading}
                  class="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
                >
                  <!-- Ikona z animacją -->
                  <div
                    class="relative h-5 w-5 flex items-center justify-center"
                  >
                    {#if activeTab === "login"}
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        in:fade={{
                          duration: elementTransition.duration,
                          delay: 150,
                        }}
                        out:fade={{ duration: elementTransition.duration / 2 }}
                      >
                        <IconLogin class="h-5 w-5" />
                      </div>
                    {:else}
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                        in:fade={{
                          duration: elementTransition.duration,
                          delay: 150,
                        }}
                        out:fade={{ duration: elementTransition.duration / 2 }}
                      >
                        <IconUserPlus class="h-5 w-5" />
                      </div>
                    {/if}
                  </div>

                  <!-- Tekst przycisku z animacją -->
                  <div
                    class="relative h-5 w-32 flex items-center justify-center"
                  >
                    {#if activeTab === "login"}
                      <div
                        class="absolute inset-0 whitespace-nowrap flex items-center justify-center"
                        in:fly={{
                          x: 10,
                          duration: elementTransition.duration,
                          delay: 150,
                        }}
                        out:fly={{
                          x: -10,
                          duration: elementTransition.duration / 2,
                        }}
                      >
                        {loading ? "Logowanie..." : "Zaloguj się"}
                      </div>
                    {:else}
                      <div
                        class="absolute inset-0 whitespace-nowrap flex items-center justify-center"
                        in:fly={{
                          x: 10,
                          duration: elementTransition.duration,
                          delay: 150,
                        }}
                        out:fly={{
                          x: -10,
                          duration: elementTransition.duration / 2,
                        }}
                      >
                        {loading ? "Tworzenie konta..." : "Utwórz konto"}
                      </div>
                    {/if}
                  </div>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-center space-x-4 mt-6">
              <div class="flex-grow h-px bg-gray-700"></div>
              <div class="text-center text-gray-500 text-sm px-2">
                Lub kontynuuj z
              </div>
              <div class="flex-grow h-px bg-gray-700"></div>
            </div>

            <button
              type="submit"
              formnovalidate
              formaction="?/googleLogin"
              onclick={saveRedirectToLocalStorage}
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded text-gray-300 hover:bg-gray-700/20 transition-all mt-4"
            >
              <div class="flex items-center justify-center w-full">
                <div class="flex items-center justify-center">
                  <BrandGoogleFilled class="h-5 w-5 mr-3" />
                  <span>Kontynuuj z Google</span>
                </div>
              </div>
            </button>

            <!-- Link do przełączania między logowaniem a rejestracją -->
            <div
              class="text-center text-gray-500 text-xs sm:text-sm h-6 relative mt-6"
            >
              {#if activeTab === "login"}
                <div
                  class="absolute inset-0 flex justify-center items-center"
                  in:fade={{ duration: elementTransition.duration, delay: 150 }}
                  out:fade={{ duration: elementTransition.duration / 2 }}
                >
                  <span class="flex items-center">
                    Nie masz konta?
                    <button
                      type="button"
                      class="text-blue-400 hover:text-blue-300 ml-1"
                      onclick={() => (activeTab = "register")}
                      >Zarejestruj się</button
                    >
                  </span>
                </div>
              {:else}
                <div
                  class="absolute inset-0 flex justify-center items-center"
                  in:fade={{ duration: elementTransition.duration, delay: 150 }}
                  out:fade={{ duration: elementTransition.duration / 2 }}
                >
                  <span class="flex items-center">
                    Masz już konto?
                    <button
                      type="button"
                      class="text-blue-400 hover:text-blue-300 ml-1"
                      onclick={() => (activeTab = "login")}>Zaloguj się</button
                    >
                  </span>
                </div>
              {/if}
            </div>

            {#if redirectParam}
              <input type="hidden" name="redirect" value={redirectParam} />
            {/if}
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}
