<script lang="ts">
  import Button from "../Button.svelte";
  import { toast, ToastContainer } from "./index";

  function showSuccessToast() {
    toast.success("Operacja zakończona pomyślnie!");
  }

  function showErrorToast() {
    toast.error("Wystąpił błąd podczas wykonywania operacji.");
  }

  function showInfoToast() {
    toast.info("To jest informacja dla użytkownika.", 8000);
  }
</script>

<div class="space-y-4">
  <h2 class="text-xl font-bold">Przykład użycia komponentu Toast</h2>
  
  <div class="flex flex-wrap gap-4">
    <Button onclick={showSuccessToast} variant="accent">Pokaż sukces</Button>
    <Button onclick={showErrorToast} variant="danger">Pokaż błąd</Button>
    <Button onclick={showInfoToast}>Pokaż informację</Button>
  </div>
</div>

<!-- Komponent ToastContainer powinien być umieszczony w głównym layoucie aplikacji -->
<ToastContainer />
