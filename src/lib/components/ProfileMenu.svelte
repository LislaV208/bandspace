<script lang="ts">
  import { stopPropagation } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import { Loader2, LogOut, Pencil, User as UserIcon, X } from "lucide-svelte";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  import { fade, slide } from "svelte/transition";

  interface Props {
    isOpen?: boolean;
    onToggle: () => void;
  }

  let { isOpen = false, onToggle }: Props = $props();

  const authState = getAuthState();
  const user = $derived(authState.user);

  let profileMenuButton: HTMLElement | null = $state(null);

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        profileMenuButton &&
        !profileMenuButton.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  });

  let userAvatar = $derived(user?.avatar_url || null);
  let userEmail = $derived(user?.email || "");
  let displayName = $derived(user?.name || userEmail);

  let isProfileModalOpen = $state(false);
  let newDisplayName = $state("");
  let isUpdating = $state(false);

  function openProfileModal() {
    newDisplayName = user?.name || "";
    isProfileModalOpen = true;
    onToggle(); // zamknij menu po kliknięciu
  }

  function closeProfileModal() {
    isProfileModalOpen = false;
  }

  async function updateProfile() {
    if (!newDisplayName.trim()) {
      toast.error("Nazwa nie może być pusta", { position: "bottom-right" });
      return;
    }

    isUpdating = true;

    try {
      const response = await fetch("/api/user-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDisplayName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Błąd podczas aktualizacji profilu"
        );
      }

      const updatedUser = await response.json();

      // Wyświetl powiadomienie o sukcesie
      toast.success("Zaktualizowano profil", { position: "bottom-right" });

      // Zamknij modal i odśwież stronę
      closeProfileModal();

      // Odśwież stronę, aby zaktualizować dane
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);

      // Przeładowanie strony
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Błąd podczas aktualizacji profilu",
        { position: "bottom-right" }
      );
    } finally {
      isUpdating = false;
    }
  }
</script>

<div class="relative">
  <button
    bind:this={profileMenuButton}
    onclick={stopPropagation(onToggle)}
    class="p-3 hover:bg-gray-700/80 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/40 flex items-center justify-center"
    title="Menu użytkownika"
  >
    {#if userAvatar}
      <img
        src={userAvatar}
        alt="Awatar użytkownika"
        class="w-8 h-8 rounded-full object-cover"
      />
    {:else}
      <UserIcon size={32} />
    {/if}
  </button>
  {#if isOpen}
    <div
      class="absolute right-0 mt-2 min-w-[12rem] max-w-xs bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg z-50 border border-gray-600/50 transition-all duration-200 ease-in-out profile-menu-popup"
      transition:slide={{ duration: 200 }}
    >
      <div class="px-4 py-3 border-b border-gray-600">
        <div class="font-medium truncate">{displayName}</div>
        <div class="text-sm text-gray-300 truncate">{userEmail}</div>
      </div>
      <button
        onclick={openProfileModal}
        class="w-full text-left px-4 py-3 text-sm hover:bg-gray-700/80 transition-all duration-200 ease-in-out text-gray-100 hover:text-white flex items-center"
      >
        <Pencil class="h-4 w-4 mr-2" />
        Edytuj profil
      </button>
      <button
        onclick={async () => {
          try {
            await authState.signOut();
            goto("/login");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }}
        class="w-full text-left px-4 py-3 text-sm hover:bg-gray-700/80 transition-all duration-200 ease-in-out text-gray-100 hover:text-white flex items-center"
      >
        <LogOut class="h-4 w-4 mr-2" />
        Wyloguj się
      </button>
    </div>
  {/if}
</div>

{#if isProfileModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
    transition:fade={{ duration: 300 }}
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      role="dialog"
      aria-labelledby="profile-modal-title"
      aria-modal="true"
      tabindex="-1"
      transition:slide={{ duration: 300 }}
    >
      <div class="flex justify-between items-center mb-6">
        <h2 id="profile-modal-title" class="text-xl font-bold">
          Edytuj profil
        </h2>
        <button
          onclick={closeProfileModal}
          class="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-700"
          aria-label="Zamknij"
        >
          <X size={20} />
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <label
            for="displayName"
            class="block text-sm font-medium text-gray-300 mb-1"
          >
            Nazwa użytkownika
          </label>
          <input
            id="displayName"
            type="text"
            bind:value={newDisplayName}
            class="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Wprowadź swoją nazwę"
            disabled={isUpdating}
          />
          <p class="text-xs text-gray-400 mt-1">
            Ta nazwa będzie widoczna dla innych użytkowników aplikacji.
          </p>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <button
            onclick={closeProfileModal}
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            disabled={isUpdating}
          >
            Anuluj
          </button>
          <button
            onclick={updateProfile}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors flex items-center justify-center min-w-[100px]"
            disabled={isUpdating}
          >
            {#if isUpdating}
              <Loader2 class="animate-spin mr-2" size={16} />
              Zapisywanie...
            {:else}
              Zapisz zmiany
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
