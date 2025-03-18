<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { getAuthState } from "$lib/state/auth-state.svelte";
  import { getSupabaseContext } from "$lib/supabase-context";
  import type { TrackComment } from "$lib/types/track_comment";
  import { formatDistanceToNow } from "date-fns";
  import { pl } from "date-fns/locale";
  import { Loader2, MessageCircleDashedIcon, Send } from "lucide-svelte";

  let { trackId, comments }: { trackId: number; comments: TrackComment[] } =
    $props();

  // Sortowanie komentarzy od najnowszych do najstarszych
  comments = comments
    ? [...comments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];

  const supabase = getSupabaseContext();
  const user = getAuthState().user;

  let sendingComment = $state(false);

  // Stan komponentu
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
  async function handleAddComment(): Promise<void> {
    if (!newCommentText.trim()) return;

    sendingComment = true;

    const { data: newComment, error } = await supabase
      .from("track_comments")
      .insert({
        content: newCommentText,
        track_id: trackId,
        user_id: user!.id,
        created_at: new Date().toISOString(),
      })
      .select("*, user:user_id(*)")
      .single();

    sendingComment = false;

    if (error) {
      console.error("Error adding comment:", error);
      return;
    }

    // Dodajemy nowy komentarz do listy i sortujemy ponownie
    comments = [newComment, ...comments];
    newCommentText = "";
    currentTimestamp = null;
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
  class="flex flex-col bg-gray-800/90 rounded-lg border border-gray-700/30 shadow-lg h-[69vh]"
>
  <div class="p-4 border-b border-gray-700/30">
    <h2 class="text-xl font-bold text-white">Komentarze</h2>
  </div>

  <!-- Lista komentarzy z przewijaniem -->
  <div
    class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
  >
    {#if comments.length === 0}
      <div class="text-gray-400 text-center py-8 flex flex-col items-center">
        <div class="text-gray-500 mb-2">
          <MessageCircleDashedIcon size={40} />
        </div>
        <p>Brak komentarzy. Dodaj pierwszy!</p>
      </div>
    {:else}
      <div class="">
        {#each comments as comment (comment.id)}
          <div
            class="group hover:bg-gray-700/20 rounded-lg p-3 -mx-3 transition-colors"
          >
            <div class="flex gap-3">
              {#if comment.user.avatar_url}
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden"
                >
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.name || comment.user.email}
                    class="w-full h-full object-cover"
                  />
                </div>
              {:else}
                <div
                  class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium"
                >
                  {getUserInitials(comment.user)}
                </div>
              {/if}

              <div class="flex-grow">
                <div class="flex justify-between items-center gap-2 mb-1">
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
      </div>
    {/if}
  </div>

  <!-- Formularz dodawania komentarza -->
  <div class="p-4 border-t border-gray-700/30 bg-gray-800">
    <form
      class="flex items-center gap-2"
      on:submit|preventDefault={handleAddComment}
    >
      <div class="flex-1 min-w-0">
        <Input
          bind:value={newCommentText}
          placeholder="Dodaj komentarz..."
          className="text-sm"
          on:keydown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && newCommentText.trim()) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
      </div>
      <div class="flex-shrink-0">
        <Button
          variant="accent"
          icon={sendingComment ? Loader2 : Send}
          disabled={!newCommentText.trim() || sendingComment}
          class={sendingComment ? "animate-spin" : ""}
        >
          <span class="sr-only">Wyślij</span>
        </Button>
      </div>
    </form>
  </div>
</div>
