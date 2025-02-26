<script lang="ts">
  import { goto } from "$app/navigation";
  import type { User } from "@supabase/supabase-js";
  import { User as UserIcon } from "lucide-svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  export let user: User;
  export let isOpen = false;
  export let onToggle: () => void;

  let profileMenuButton: HTMLElement;

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

  $: userAvatar = user.user_metadata?.avatar_url || null;
  $: userEmail = user.user_metadata?.email || "";
  $: displayName = user.user_metadata?.full_name || userEmail;
</script>

<div class="relative">
  <button
    bind:this={profileMenuButton}
    on:click|stopPropagation={onToggle}
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
        on:click={async () => {
          try {
            await fetch("/api/auth/signout", { method: "POST" });
            goto("/login");
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
