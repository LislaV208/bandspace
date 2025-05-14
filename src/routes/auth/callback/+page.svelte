<script>
  import { Loader2 } from "lucide-svelte";
  import { onMount } from "svelte";

  export let defaultRedirect = "/dashboard";

  onMount(() => {
    // Odczytaj zapisany URL z localStorage
    const savedRedirect = localStorage.getItem("redirectAfterLogin");
    console.log("Odczytano URL z localStorage:", savedRedirect);

    // Jeśli zapisano URL, przekieruj do niego, w przeciwnym razie do dashboardu
    const redirectUrl = savedRedirect || defaultRedirect;

    // Opcjonalnie usuwamy zapis z localStorage
    localStorage.removeItem("redirectAfterLogin");

    // Przekierowanie
    window.location.href = redirectUrl;
  });
</script>

<svelte:head>
  <title>Przekierowywanie...</title>
</svelte:head>

<div class="flex items-center justify-center h-full bg-[#101827]">
  <Loader2 class="animate-spin text-blue-500" size={40} />
</div>

<noscript>
  <meta http-equiv="refresh" content={`0;url=${defaultRedirect}`} />
</noscript>
