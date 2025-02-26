<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import ProfileMenu from "$lib/components/ProfileMenu.svelte";
  import ShareModal from "$lib/components/ShareModal.svelte";
  import type { User } from "@supabase/supabase-js";
  import { ArrowLeft, Share2 } from "lucide-svelte";
  import "../app.css";

  $: user = ($page.data.user as User) || null;

  let isShareModalOpen = false;
  let isProfileMenuOpen = false;

  function handleShare(email: string) {
    console.log("Sharing project with:", email);
    isShareModalOpen = false;
  }

  $: currentProjectId = $page.params.id;
  $: isProjectDetailPage = currentProjectId !== undefined;
</script>

<div class="min-h-screen bg-gray-900 text-white">
  {#if user != null}
    <header class="bg-gray-800 shadow-lg">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            {#if isProjectDetailPage}
              <button
                on:click={() => goto("/projects")}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Back to projects"
              >
                <ArrowLeft size={24} />
              </button>
            {/if}
            <div class="text-xl font-bold">BandSpace</div>
          </div>
          <div class="flex items-center space-x-2">
            {#if isProjectDetailPage}
              <button
                on:click={() => (isShareModalOpen = true)}
                class="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Share project"
              >
                <Share2 size={24} />
              </button>
            {/if}
            <ProfileMenu
              {user}
              isOpen={isProfileMenuOpen}
              onToggle={() => (isProfileMenuOpen = !isProfileMenuOpen)}
            />
          </div>
        </div>
      </nav>
    </header>
  {/if}

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>

  <ShareModal
    isOpen={isShareModalOpen}
    onClose={() => (isShareModalOpen = false)}
    onShare={handleShare}
  />
</div>
