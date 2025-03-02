<script lang="ts">
  import { stopPropagation } from "svelte/legacy";

  import { goto } from "$app/navigation";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import { getTestState } from "$lib/state/test-state.svelte";
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

  // const user = $derived(authState.user);

  // $inspect(user);

  // const userContext = getContext<() => User | null>("user");
  // const user = userContext();

  // $inspect(authState());

  // const name = getContext<string>("user");

  // $inspect(name);
  // const user = $derived(authState.user);

  const testState = getTestState();
  const name = $derived(testState.name);

  $inspect(user);

  // let user: User | null = null;

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

  let userAvatar = $derived(user?.user_metadata?.avatar_url || null);
  let userEmail = $derived(user?.user_metadata?.email || "");
  let displayName = $derived(user?.user_metadata?.full_name || userEmail);
</script>

<div class="relative">
  <button
    bind:this={profileMenuButton}
    onclick={stopPropagation(onToggle)}
    class="p-2 hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center"
    title="User menu"
  >
    {#if userAvatar}
      <img
        src={userAvatar}
        alt="User avatar"
        class="w-6 h-6 rounded-full object-cover"
      />
    {:else}
      <UserIcon size={24} />
    {/if}
  </button>
  {#if isOpen}
    <div
      class="absolute right-0 mt-2 min-w-[12rem] max-w-xs bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-600 transition-all duration-200 ease-in-out profile-menu-popup"
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
            // setContext("user", "andrzej");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }}
        class="w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors text-gray-100"
      >
        Log out
      </button>
    </div>
  {/if}
</div>
