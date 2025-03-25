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

  // Inicjalizacja wysokości pola tekstowego po załadowaniu komponentu
  $effect(() => {
    if (commentTextarea) {
      // Ustaw początkową wysokość pola tekstowego
      const initialHeight = 38; // Wysokość dla jednej linii tekstu
      commentTextarea.style.height = `${initialHeight}px`;
      commentTextarea.style.overflowY = "hidden";
    }
  });

  function autoResizeTextarea() {
    if (!commentTextarea) return;

    // Resetuj wysokość, aby uzyskać prawidłową wysokość scrollHeight
    commentTextarea.style.height = "auto";

    // Ustaw nową wysokość na podstawie zawartości, ale z maksymalną wysokością
    const newHeight = Math.min(commentTextarea.scrollHeight, 128); // 128px to około 4 linii
    commentTextarea.style.height = `${newHeight}px`;

    // Pokaż scrollbar tylko wtedy, gdy zawartość przekracza maksymalną wysokość
    commentTextarea.style.overflowY =
      commentTextarea.scrollHeight > 128 ? "auto" : "hidden";
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
    class="p-4 border-b border-gray-700/30 flex justify-between items-center bg-gray-800/30"
  >
    <div class="flex items-center gap-2">
      <svg
        class="w-5 h-5 text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        ></path>
      </svg>
      <h2 class="text-xl font-bold text-white">Komentarze</h2>
      <span
        class="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full ml-2"
        >{comments.length}</span
      >
    </div>

    <!-- Przycisk powrotu (tylko na mobilnych i tabletach) -->
    <button
      class="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700/50"
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
    {#if comments.length === 0}
      <div
        class="flex flex-col items-center justify-center h-full py-8 text-center"
      >
        <svg
          class="w-12 h-12 text-gray-500 mb-3 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          ></path>
        </svg>
        <p class="text-gray-400 mb-1">Brak komentarzy</p>
        <p class="text-gray-500 text-sm">
          Bądź pierwszą osobą, która skomentuje ten utwór
        </p>
      </div>
    {:else}
      <div class="space-y-0">
        {#each comments as comment, index (comment.id)}
          <div
            class="group hover:bg-gray-700/40 rounded-lg py-3 px-3.5 -mx-3 transition-colors"
            in:slide={{ duration: 400 }}
            out:fade={{ duration: 300 }}
          >
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <UserAvatar user={comment.user} />
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex justify-between items-center gap-2 mb-1">
                  <span class="font-medium text-white text-sm truncate"
                    >{comment.user.name}</span
                  >
                  <span
                    class="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1"
                    title={format(
                      new Date(comment.created_at),
                      "dd MMMM yyyy, HH:mm:ss",
                    )}
                  >
                    <svg
                      class="w-3 h-3 opacity-70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {format(new Date(comment.created_at), "dd.MM.yyyy HH:mm")}
                  </span>
                </div>
                <p
                  class="text-gray-200 text-sm whitespace-pre-line leading-relaxed"
                >
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
    {/if}
  </div>

  <!-- Formularz dodawania komentarza -->
  <div class="p-4 border-t border-gray-700/30 bg-gray-800/20">
    {#if commentError}
      <div
        class="mb-3 p-3 bg-red-900/30 border border-red-900/50 rounded-md text-red-200 text-sm flex items-center gap-2"
        in:slide={{ duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        <svg
          class="w-4 h-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{commentError}</span>
      </div>
    {/if}
    <form
      class="flex items-start gap-3"
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
          class="w-full min-h-10 max-h-32 bg-gray-800/70 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
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
        <p class="mt-1.5 text-xs text-gray-500 px-1">
          Naciśnij Shift+Enter, aby dodać nową linię
        </p>
      </div>
      <div class="flex-shrink-0">
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg p-2.5 text-sm font-medium transition-colors flex items-center justify-center h-10 w-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          aria-label="Wyślij komentarz"
          disabled={!commentInputValue.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  </div>
</div>
