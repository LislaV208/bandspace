<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import type { TrackComment } from "$lib/types/track_comment";
  import { formatDistanceToNow } from "date-fns";
  import { pl } from "date-fns/locale";
  import { Send } from "lucide-svelte";

  // Przykładowe dane komentarzy
  const mockComments: TrackComment[] = [
    {
      id: 1,
      content: "Ten fragment gitary brzmi świetnie!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 godziny temu
      user: {
        id: "user-1",
        name: "Adria Nowak",
        email: "adria@example.com",
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 2,
      content: "Możemy dodać więcej basu w tym kawałku?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dzień temu
      user: {
        id: "user-2",
        name: "Michał Kowalski",
        email: "michal@example.com",
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 3,
      content:
        "Ogólne wrażenia: świetny kawałek, ale wokale można trochę poprawić w niektórych miejscach.",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minut temu
      user: {
        id: "user-1",
        name: "Adria Nowak",
        email: "adria@example.com",
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    },
  ];

  // Stan komponentu
  let comments = $state<TrackComment[]>(mockComments);
  let newCommentText = $state("");
  let currentTimestamp = $state<number | null>(null);

  /**
   * Formats the timestamp in MM:SS format
   * @param seconds - Timestamp in seconds
   * @returns Formatted timestamp string
   */
  function formatTimestamp(seconds: number | null): string {
    if (seconds === null) return "";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  /**
   * Handles adding a new comment
   */
  function handleAddComment(): void {
    if (!newCommentText.trim()) return;

    // W rzeczywistej implementacji wysłalibyśmy komentarz do API
    const newComment: TrackComment = {
      id: Date.now(), // tymczasowe ID
      content: newCommentText,
      created_at: new Date().toISOString(),
      user: {
        id: "current-user", // w rzeczywistości pobralibyśmy ID zalogowanego użytkownika
        name: "Użytkownik Bieżący",
        email: "current@example.com",
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    };

    comments = [newComment, ...comments];
    newCommentText = "";
    currentTimestamp = null;
  }

  /**
   * Sets the current timestamp for a new comment
   * @param seconds - Timestamp in seconds
   */
  function setCurrentTimestamp(seconds: number): void {
    currentTimestamp = seconds;
  }

  /**
   * Generates initials from user name or email
   * @param user - User object
   * @returns String with user initials
   */
  function getUserInitials(user: TrackComment["user"]): string {
    if (user.name) {
      const nameParts = user.name.split(" ");
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }

    return user.email?.substring(0, 2).toUpperCase() || "??";
  }
</script>

<div
  class="h-[600px] flex flex-col bg-gray-800/90 rounded-lg border border-gray-700/30 shadow-lg"
>
  <div class="p-4 border-b border-gray-700/30">
    <h2 class="text-xl font-bold text-white">Komentarze</h2>
  </div>

  <!-- Lista komentarzy z przewijaniem -->
  <div
    class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
  >
    <div class="space-y-5">
      {#if comments.length === 0}
        <div class="text-gray-400 text-center py-8 flex flex-col items-center">
          <div class="text-gray-500 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
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
          </div>
          <p>Brak komentarzy. Dodaj pierwszy!</p>
        </div>
      {:else}
        {#each comments as comment (comment.id)}
          <div
            class="group hover:bg-gray-700/20 rounded-lg p-3 -mx-3 transition-colors"
          >
            <div class="flex gap-3">
              <!-- Awatar użytkownika (inicjały gdy brak awatara) -->
              <div
                class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium"
              >
                {getUserInitials(comment.user)}
              </div>

              <div class="flex-grow">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="font-medium text-white">
                    {comment.user.name || comment.user.email}
                  </span>

                  <span class="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: pl,
                    })}
                  </span>
                </div>

                <p class="text-gray-300 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Formularz dodawania komentarza -->
  <div class="p-4 border-t border-gray-700/30 bg-gray-800">
    {#if currentTimestamp !== null}
      <div class="mb-2 flex items-center">
        <div
          class="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded flex items-center gap-1"
        >
          <span>Znacznik czasu: {formatTimestamp(currentTimestamp)}</span>
          <button
            type="button"
            class="text-xs text-blue-300 hover:text-white ml-2"
            on:click={() => (currentTimestamp = null)}
          >
            ×
          </button>
        </div>
      </div>
    {/if}

    <form
      class="flex items-center gap-2"
      on:submit|preventDefault={handleAddComment}
    >
      <div class="flex-1">
        <Input
          bind:value={newCommentText}
          placeholder="Dodaj komentarz..."
          className="text-sm"
        />
      </div>
      <Button variant="accent" icon={Send} disabled={!newCommentText.trim()}>
        <span class="sr-only">Wyślij</span>
      </Button>
    </form>
  </div>
</div>
