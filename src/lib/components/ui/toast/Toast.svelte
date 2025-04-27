<script lang="ts">
  import { AlertCircle, CheckCircle, Info, X } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import type { ToastType } from "./toastStore";

  interface ToastProps {
    type: ToastType;
    message: string;
    duration?: number;
    onClose: () => void;
  }

  let { type, message, duration = 5000, onClose }: ToastProps = $props();

  let isVisible = $state(true);
  let progress = $state(100);
  let isPaused = $state(false);

  // Obsługa automatycznego zamknięcia
  $effect(() => {
    if (!isVisible) return;

    if (!isPaused) {
      const timer = setTimeout(() => {
        isVisible = false;
        setTimeout(onClose, 300); // Poczekaj na zakończenie animacji
      }, duration);

      // Timer paska postępu
      const interval = setInterval(() => {
        progress = Math.max(0, progress - 100 / (duration / 100));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  });

  // Style dla różnych typów powiadomień

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  function handleClose() {
    isVisible = false;
    setTimeout(onClose, 300);
  }
</script>

<div
  class="fixed bottom-4 right-4 max-w-sm w-full bg-gray-800 border border-gray-700
    shadow-lg rounded-lg overflow-hidden z-50 transform transition-all duration-300"
  class:translate-y-0={isVisible}
  class:opacity-100={isVisible}
  class:translate-y-2={!isVisible}
  class:opacity-0={!isVisible}
  onmouseenter={() => (isPaused = true)}
  onmouseleave={() => (isPaused = false)}
  in:fly={{ y: 20, duration: 300 }}
  out:fade={{ duration: 300 }}
  role="alert"
>
  <div class="p-4 flex gap-3">
    <div class="flex-shrink-0">
      {#if type === "success"}
        <CheckCircle size={20} class={iconColors[type]} />
      {:else if type === "error"}
        <AlertCircle size={20} class={iconColors[type]} />
      {:else}
        <Info size={20} class={iconColors[type]} />
      {/if}
    </div>
    <div class="flex-1 pr-6">
      <p class="text-sm text-white">{message}</p>
    </div>
    <button
      onclick={handleClose}
      class="absolute top-4 right-4 text-gray-400 hover:text-white"
    >
      <X size={16} />
    </button>
  </div>

  <!-- Pasek postępu -->
  <div
    class="h-1 transition-all duration-100 ease-linear {bgColors[type]}"
    style="width: {progress}%"
  ></div>
</div>
