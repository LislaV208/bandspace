<script lang="ts">
  import { goto } from "$app/navigation";
  import PopupMenu from "$lib/components/ui/popup/PopupMenu.svelte";
  import PopupMenuOption from "$lib/components/ui/popup/PopupMenuOption.svelte";
  import EditProfileModal from "$lib/components/user-profile/EditProfileModal.svelte";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import type { User } from "$lib/types/user";
  import { LogOut, Pencil, UserIcon } from "lucide-svelte";
  import toast from "svelte-french-toast";

  const { user }: { user: User } = $props();
  const authState = getAuthState();

  let isEditProfileModalOpen = $state(false);
</script>

<!-- <Toaster /> -->
<PopupMenu>
  {#snippet triggerContent(onclick)}
    <button
      {onclick}
      class="p-3 hover:bg-gray-700/80 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/40 flex items-center justify-center"
    >
      {#if user?.avatar_url}
        <img
          src={user?.avatar_url}
          alt="Awatar użytkownika"
          class="w-8 h-8 rounded-full object-cover"
        />
      {:else}
        <UserIcon size={32} />
      {/if}
    </button>
  {/snippet}
  {#snippet staticContent()}
    <div class="px-4 py-3 border-b border-gray-600">
      <div class="font-medium truncate">
        {user?.name || user?.email}
      </div>
      <div class="text-sm text-gray-300 truncate">{user?.email}</div>
    </div>
  {/snippet}
  <PopupMenuOption
    icon={Pencil}
    text="Edytuj profil"
    onclick={() => {
      isEditProfileModalOpen = true;
    }}
  />
  <PopupMenuOption
    icon={LogOut}
    text="Wyloguj się"
    onclick={async () => {
      try {
        await authState.signOut();
        goto("/");
      } catch (error) {
        console.error("Error signing out:", error);
        toast.error("Nie udało się wylogować", { position: "bottom-right" });
      }
    }}
  />
</PopupMenu>

<EditProfileModal bind:isOpen={isEditProfileModalOpen} {user} />
