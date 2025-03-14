<script lang="ts">
  import { stopPropagation } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import { User as UserIcon } from "lucide-svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

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
      class="absolute right-0 mt-2 min-w-[12rem] max-w-xs bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg py-2 z-50 border border-gray-600/50 transition-all duration-200 ease-in-out profile-menu-popup"
      transition:slide={{ duration: 200 }}
    >
      <div class="px-4 py-3 border-b border-gray-600">
        <div class="font-medium truncate">{displayName}</div>
        <div class="text-sm text-gray-300 truncate">{userEmail}</div>
      </div>
      <button
        onclick={async () => {
          try {
            await authState.signOut();
            goto("/login");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }}
        class="w-full text-left px-4 py-3 text-sm hover:bg-gray-700/80 transition-all duration-200 ease-in-out text-gray-100 hover:text-white"
      >
        Wyloguj się
      </button>
    </div>
  {/if}
</div>
