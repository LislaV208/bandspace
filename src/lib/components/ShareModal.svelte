<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { fade, slide } from 'svelte/transition';

  interface Props {
    isOpen?: boolean;
    onClose: () => void;
    onShare: (email: string) => void;
  }

  let { isOpen = false, onClose, onShare }: Props = $props();

  let shareEmail = $state('');

  function handleShare() {
    if (shareEmail.trim()) {
      onShare(shareEmail);
      shareEmail = '';
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    transition:fade
  >
    <div
      class="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      transition:slide
    >
      <h2 class="text-xl font-bold mb-4">Share Project</h2>
      <form onsubmit={preventDefault(handleShare)}>
        <input
          type="email"
          bind:value={shareEmail}
          placeholder="Enter email address"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
        />
        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            class="px-4 py-2 text-gray-300 hover:text-white"
            onclick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded font-medium"
          >
            Share
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}