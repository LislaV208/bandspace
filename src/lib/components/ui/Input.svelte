<script lang="ts">
  import "$lib/styles/autofill-fix.css";
  import { Eye, EyeOff } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";

  interface Props {
    value?: string;
    label?: string;
    error?: string;
    className?: string;
    autoFocus?: boolean;
    prefix?: Snippet;
    suffix?: Snippet;
    [props: string]: any;
  }

  let {
    value = $bindable(),
    label,
    error,
    className,
    autoFocus = false,
    prefix,
    suffix,
    ...props
  }: Props = $props();

  let inputElement: HTMLInputElement;
  let isPasswordVisible = $state(false);

  // Sprawdzamy, czy to pole hasła
  const isPasswordField = $derived(props.type === "password");

  // Dynamicznie zmieniamy typ pola w zależności od stanu widoczności hasła
  const inputType = $derived(
    isPasswordField && isPasswordVisible ? "text" : props.type
  );

  // Funkcja przełączająca widoczność hasła
  function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
  }

  onMount(() => {
    if (autoFocus && inputElement) {
      inputElement.focus();
    }
  });
</script>

<div class="w-full">
  {#if label}
    <label for={props.id} class="block text-sm font-medium text-gray-300 mb-1"
      >{label}</label
    >
  {/if}

  <!-- Używamy flexboxa zamiast pozycjonowania absolutnego -->
  <div
    class="flex items-center bg-gray-800 rounded-lg overflow-hidden border {error
      ? 'border-red-500'
      : 'border-transparent'} focus-within:ring-2 focus-within:ring-blue-500 transition-all {className}"
    style="background-color: #1f2937;"
  >
    <!-- Ikona prefiksu (na początku pola) -->
    {#if prefix}
      <div class="flex-shrink-0 pl-3 pr-2 text-gray-500">
        {@render prefix()}
      </div>
    {/if}

    <input
      bind:value
      bind:this={inputElement}
      {...props}
      type={inputType}
      class="flex-grow bg-transparent border-none outline-none py-2 px-2 text-gray-300 placeholder-gray-500 w-full"
    />

    <!-- Ikona sufiksu (na końcu pola) -->
    {#if suffix && !isPasswordField}
      <div class="flex-shrink-0 pr-3 pl-2 text-gray-500">
        {@render suffix()}
      </div>
    {/if}

    <!-- Przycisk podglądu hasła (ma pierwszeństwo przed ikoną sufiksu) -->
    {#if isPasswordField}
      <button
        type="button"
        class="flex-shrink-0 pr-3 pl-2 text-gray-400 hover:text-gray-200 transition-colors"
        onclick={togglePasswordVisibility}
        aria-label={isPasswordVisible ? "Ukryj hasło" : "Pokaż hasło"}
      >
        {#if isPasswordVisible}
          <EyeOff size={18} />
        {:else}
          <Eye size={18} />
        {/if}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="mt-1 text-sm text-red-500">{error}</p>
  {/if}
</div>
