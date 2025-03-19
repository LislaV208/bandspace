<script lang="ts">
  import type { User } from "$lib/types/user";

  const { user }: { user: User } = $props();
</script>

<div class="flex items-center gap-2">
  {#if user.avatar_url}
    <img
      class="w-8 h-8 rounded-full object-cover"
      src={user.avatar_url}
      alt={user.name || user.email}
    />
  {:else}
    <div
      class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
    >
      {user.name
        ? user.name.charAt(0).toUpperCase()
        : user.email
          ? user.email.charAt(0).toUpperCase()
          : "U"}
    </div>
  {/if}
</div>
