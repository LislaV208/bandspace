<script lang="ts">
  import { goto } from "$app/navigation";
  import PopupMenu from "$lib/components/ui/popup/PopupMenu.svelte";
  import PopupMenuOption from "$lib/components/ui/popup/PopupMenuOption.svelte";
  import { toast } from "$lib/components/ui/toast";
  import EditProfileModal from "$lib/components/user-profile/EditProfileModal.svelte";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import type { User } from "$lib/types/user";
  import { ChevronDown, LogOut, Settings, UserIcon } from "lucide-svelte";

  const { user }: { user: User } = $props();
  const authState = getAuthState();

  let isEditProfileModalOpen = $state(false);
</script>

<PopupMenu>
  {#snippet triggerContent(onclick)}
    <button
      {onclick}
      class="flex items-center space-x-2 text-sm rounded-full hover:bg-gray-800 transition-colors p-1 pr-2"
    >
      {#if user?.avatar_url}
        <div
          class="h-8 w-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center"
        >
          <img
            src={user?.avatar_url}
            alt={user?.name || user?.email || "Użytkownik"}
            class="h-full w-full object-cover"
          />
        </div>
      {:else}
        <div
          class="h-8 w-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white font-medium"
        >
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : user?.email
              ? user.email.charAt(0).toUpperCase()
              : "U"}
        </div>
      {/if}
      <span class="hidden md:inline text-white"
        >{user?.name || user?.email}</span
      >
      <ChevronDown size={16} class="text-gray-400" />
    </button>
  {/snippet}
  {#snippet staticContent()}
    <div class="p-3 border-b border-gray-700">
      <p class="text-sm font-medium text-white">{user?.name || "Użytkownik"}</p>
      <p class="text-xs text-gray-400 truncate">{user?.email}</p>
    </div>
  {/snippet}
  <div class="py-2">
    <PopupMenuOption
      icon={UserIcon}
      text="Profil"
      onclick={() => {
        isEditProfileModalOpen = true;
      }}
    />
    <PopupMenuOption
      icon={Settings}
      text="Ustawienia"
      onclick={() => {
        isEditProfileModalOpen = true;
      }}
    />
  </div>
  <div class="py-2 border-t border-gray-700">
    <PopupMenuOption
      icon={LogOut}
      text="Wyloguj się"
      onclick={async () => {
        try {
          await authState.signOut();
          goto("/");
        } catch (error) {
          console.error("Error signing out:", error);
          toast.error("Nie udało się wylogować");
        }
      }}
    />
  </div>
</PopupMenu>

<EditProfileModal bind:isOpen={isEditProfileModalOpen} {user} />
