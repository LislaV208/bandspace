<script lang="ts">
  import UserAvatar from "$lib/components/UserAvatar.svelte";
  import type { TrackComment } from "$lib/types/track_comment";
  import { format } from "date-fns";
  import { Send } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";

  let {
    comments = $bindable(),
    showMobileComments = $bindable(),
    addComment,
  }: {
    comments: TrackComment[];
    showMobileComments: boolean;
    addComment: (content: string) => Promise<TrackComment | null>;
  } = $props();

  let commentInputValue = $state("");
  let commentError = $state<string | null>(null);
  let commentTextarea: HTMLTextAreaElement;

  function autoResizeTextarea() {
    if (!commentTextarea) return;

    // Resetuj wysokość, aby uzyskać prawidłową wysokość scrollHeight
    commentTextarea.style.height = "auto";

    // Ustaw nową wysokość na podstawie zawartości, ale z maksymalną wysokością
    const newHeight = Math.min(commentTextarea.scrollHeight, 128); // 128px to około 4 linii
    commentTextarea.style.height = `${newHeight}px`;
  }

  async function handleAddComment() {
    if (!commentInputValue.trim()) return;

    commentError = null;

    const newComment = await addComment(commentInputValue);
    if (!newComment) {
      console.error("Nie udało się dodać komentarza");
      commentError = "Nie udało się dodać komentarza";
      return;
    }
    comments = [newComment, ...comments];

    commentInputValue = "";
  }
</script>

<div
  class="lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-800 h-full flex flex-col {!showMobileComments
    ? 'hidden lg:flex'
    : 'flex'}"
>
  <!-- Nagłówek panelu komentarzy -->
  <div
    class="p-4 border-b border-gray-700/30 flex justify-between items-center"
  >
    <h2 class="text-xl font-bold text-white">Komentarze</h2>

    <!-- Przycisk powrotu (tylko na mobilnych i tabletach) -->
    <button
      class="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
      onclick={() => (showMobileComments = false)}
      aria-label="Powrót do plików audio"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5"></path>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>
  </div>

  <!-- Lista komentarzy z przewijaniem -->
  <div
    class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
  >
    <!-- Przykładowe komentarze -->
    <div class="space-y-0">
      {#each comments as comment, index (comment.id)}
        <div
          class="group hover:bg-gray-700/40 rounded-lg py-2.5 px-3 -mx-3 transition-colors"
          in:slide={{ duration: 500 }}
          out:fade={{ duration: 500 }}
        >
          <div class="flex gap-2">
            <UserAvatar user={comment.user} />
            <div class="flex-grow min-w-0">
              <div class="flex justify-between items-center gap-2">
                <span class="font-medium text-white text-sm truncate"
                  >{comment.user.name}</span
                >
                <span class="text-xs text-gray-500 whitespace-nowrap"
                  >{format(
                    new Date(comment.created_at),
                    "dd.MM.yyyy HH:mm"
                  )}</span
                >
              </div>
              <p class="text-gray-300 text-sm whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
        {#if index < comments.length - 1}
          <div class="py-2">
            <div class="border-b border-gray-700/30"></div>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Formularz dodawania komentarza -->
  <div class="p-3 border-t border-gray-700/30 bg-gray-800/20">
    {#if commentError}
      <div
        class="mb-3 p-2 bg-red-900/30 border border-red-900/50 rounded-md text-red-200 text-sm"
      >
        {commentError}
      </div>
    {/if}
    <form
      class="flex items-center gap-2"
      onsubmit={(e) => {
        e.preventDefault();
        handleAddComment();
      }}
    >
      <div class="flex-1 min-w-0">
        <textarea
          bind:value={commentInputValue}
          bind:this={commentTextarea}
          placeholder="Dodaj komentarz..."
          class="w-full min-h-10 max-h-32 bg-gray-800/70 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-auto"
          rows="1"
          oninput={autoResizeTextarea}
          onkeydown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (commentInputValue.trim()) {
                handleAddComment();
              }
            }
          }}
        ></textarea>
      </div>
      <div class="flex-shrink-0 self-start">
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 text-sm font-medium transition-colors flex items-center justify-center h-10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Wyślij komentarz"
          disabled={!commentInputValue}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  </div>
</div>
