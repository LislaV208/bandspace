<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Button from "$lib/components/ui/Button.svelte";
  // Załóżmy, że ten komponent jest elastyczny
  import { AlertTriangle, Frown, Home, SearchX } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";

  let IconComponent: typeof AlertTriangle;
  let iconColorClass = "text-yellow-400"; // Domyślnie dla ogólnego błędu

  // Dobór ikony i jej koloru w zależności od statusu błędu
  if ($page.status === 404) {
    IconComponent = SearchX;
    iconColorClass = "text-sky-400"; // Niebieskawy dla "nie znaleziono"
  } else if ($page.status >= 500) {
    IconComponent = AlertTriangle;
    iconColorClass = "text-red-400"; // Czerwony dla poważnych błędów serwera
  } else if ($page.status === 403) {
    // Np. brak dostępu
    IconComponent = Frown;
    iconColorClass = "text-orange-400";
  } else {
    // Inne błędy klienta lub nieokreślone
    IconComponent = AlertTriangle;
    iconColorClass = "text-yellow-500"; // Żółty jako ostrzeżenie
  }
</script>

<!-- Główny kontener strony -->
<div
  class="h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#171923] text-slate-200"
>
  <!-- Karta Błędu -->
  <div
    class="w-full max-w-lg bg-[#232738] rounded-xl shadow-2xl overflow-hidden"
    in:fade={{ duration: 400, delay: 150 }}
  >
    <!-- Sekcja z Ikoną (może mieć subtelnie inne tło dla wizualnego oddzielenia) -->
    <div
      class="flex justify-center items-center py-10 bg-[#2a2f42]"
      in:fly={{ y: -20, duration: 500, delay: 200 }}
    >
      <div class="p-4 bg-slate-700/40 rounded-full shadow-md">
        <svelte:component
          this={IconComponent}
          class={iconColorClass}
          size={56}
          stroke-width={1.75}
        />
      </div>
    </div>

    <!-- Sekcja z Treścią -->
    <div class="p-6 sm:p-8 space-y-6 text-center">
      <div class="space-y-3" in:fly={{ y: 20, duration: 500, delay: 300 }}>
        <h1 class="text-3xl sm:text-4xl font-semibold text-slate-100">
          {#if $page.status === 404}
            Strona nie istnieje
          {:else}
            Coś poszło nie tak...
          {/if}
        </h1>

        <p class="text-slate-400 text-md sm:text-lg leading-relaxed">
          {#if $page.status === 404}
            Niestety, nie możemy znaleźć strony, której szukasz. Sprawdź adres
            lub wróć na stronę główną.
          {:else}
            Przepraszamy za kłopoty. Wystąpił nieoczekiwany błąd (kod: {$page.status}).
            Nasz zespół już nad tym pracuje.
          {/if}
        </p>
      </div>

      {#if $page.error?.message && $page.status !== 404}
        <div
          class="p-4 mt-2 bg-slate-700/60 border border-slate-600/80 rounded-lg text-left text-sm"
        >
          <p class="font-medium text-slate-300 mb-1">Informacja techniczna:</p>
          <pre
            class="whitespace-pre-wrap break-words text-slate-400 text-xs font-mono">{$page
              .error.message}</pre>
        </div>
      {/if}

      <div class="pt-4" in:fly={{ y: 20, duration: 500, delay: 400 }}>
        <Button
          onclick={() => goto("/")}
          class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3
                 bg-indigo-600 hover:bg-indigo-700 text-white
                 text-md font-medium rounded-lg shadow-md
                 transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#232738] focus:ring-indigo-500"
        >
          <Home class="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Wróć na stronę główną
        </Button>
      </div>
    </div>
  </div>
</div>
