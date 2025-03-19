<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { Plus, Send } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  // Przykładowe sekcje głównej zawartości
  const contentSections = Array.from({ length: 11 }, (_, i) => {
    const id = i + 1;

    let title = `Sekcja ${id}`;
    let content =
      id <= 3
        ? `Przykładowa zawartość sekcji ${id}. Może to być ${
            id === 1
              ? "player audio, lista plików"
              : id === 2
                ? "formularz, informacje o utworze"
                : "lista powiązanych utworów"
          }, itp.`
        : id === 7
          ? "Ostatnia sekcja testowa. Tutaj mogą znajdować się informacje o planach wydawniczych i promocyjnych."
          : "Dodatkowa sekcja do przewijania. Zawiera informacje o procesie nagrywania utworu.";

    return { id, title, content };
  });

  // Przykładowe komentarze
  const comments = Array.from({ length: 15 }, (_, i) => {
    const id = i + 1;
    const users = [
      { initials: "JK", name: "Jan Kowalski", color: "blue" },
      { initials: "AN", name: "Anna Nowak", color: "green" },
      { initials: "TW", name: "Tomasz Wieczorek", color: "purple" },
      { initials: "KL", name: "Karolina Lis", color: "red" },
      { initials: "MZ", name: "Marcin Zieliński", color: "yellow" },
    ];

    const userIndex = i % users.length;
    const minutes = 10 + Math.floor(i / 12) * 1;
    const seconds = 30 + (i % 12) * 5;

    return {
      id,
      user: users[userIndex],
      timestamp: `19.03.2025 ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`,
      content:
        "To jest przykładowy komentarz do utworu. Może zawierać sugestie dotyczące miksu, pytania o proces nagrywania lub inne uwagi związane z utworem.",
    };
  });

  // Przykładowe dane utworu
  const trackInfo = {
    title: "Przykładowy utwór",
    artist: "Zespół testowy",
    duration: 237, // w sekundach
    currentTime: 85, // w sekundach
  };

  // Formatowanie czasu (mm:ss)
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<!-- Główny kontener z flexbox dla układu dwukolumnowego -->
<div class="flex h-full bg-gray-900 overflow-hidden">
  <!-- Lewa kolumna - główna zawartość z odtwarzaczem na dole -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Główna zawartość z przewijaniem -->
    <div
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
    >
      <div class="flex justify-between items-center gap-2 p-4 sm:p-6">
        <div class="flex-1">
          <Breadcrumbs project={data.project} recording={data.recording} />
        </div>
        <Button primary><Plus /> Dodaj plik</Button>
      </div>
      <!-- Główna zawartość strony -->
      <div class="container mx-auto p-4 sm:p-6">
        <!-- Przykładowa zawartość -->
        <div class="space-y-4">
          {#each contentSections as section}
            <div
              class="bg-gray-800/70 rounded-lg border border-gray-700/30 p-4"
            >
              <h3 class="text-lg font-medium text-white mb-2">
                {section.title}
              </h3>
              <p class="text-gray-300">
                {section.content}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Odtwarzacz audio na dole lewej kolumny -->
    <div
      class="h-24 border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-sm flex items-center px-4 py-2 shrink-0"
    >
      <div class="w-full flex items-center gap-4">
        <!-- Informacje o utworze -->
        <div class="flex items-center gap-3 w-1/4">
          <!-- Miniatura utworu -->
          <div
            class="w-12 h-12 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
          >
            <div class="text-blue-400 text-xl">♪</div>
          </div>

          <!-- Tytuł i wykonawca -->
          <div class="min-w-0">
            <div class="text-white font-medium text-sm truncate">
              {trackInfo.title}
            </div>
            <div class="text-gray-400 text-xs truncate">{trackInfo.artist}</div>
          </div>
        </div>

        <!-- Kontrolki odtwarzacza -->
        <div class="flex-1 flex flex-col items-center justify-center gap-1">
          <!-- Pasek postępu -->
          <div class="w-full flex items-center gap-2 px-4">
            <span class="text-xs text-gray-400 w-8 text-right"
              >{formatTime(trackInfo.currentTime)}</span
            >
            <div class="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500"
                style="width: {(trackInfo.currentTime / trackInfo.duration) *
                  100}%"
              ></div>
            </div>
            <span class="text-xs text-gray-400 w-8"
              >{formatTime(trackInfo.duration)}</span
            >
          </div>
          <!-- Przyciski kontrolne -->
          <div class="flex items-center gap-3">
            <!-- Poprzedni -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Poprzedni utwór"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>

            <!-- Odtwarzaj/Pauza -->
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors"
              aria-label="Odtwarzaj"
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
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>

            <!-- Następny -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Następny utwór"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Kontrolki dodatkowe -->
        <div class="w-1/4 flex justify-end items-center gap-3">
          <!-- Głośność -->
          <div class="flex items-center gap-2">
            <!-- Ikona głośności -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-gray-400"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            <!-- Pasek głośności -->
            <div class="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gray-400" style="width: 70%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Prawa kolumna - panel komentarzy (stała szerokość) -->
  <div class="w-80 md:w-96 border-l border-gray-800 h-full flex flex-col">
    <!-- Nagłówek panelu komentarzy -->
    <div class="p-4 border-b border-gray-700/30">
      <h2 class="text-xl font-bold text-white">Komentarze</h2>
    </div>

    <!-- Lista komentarzy z przewijaniem -->
    <div
      class="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
    >
      <!-- Przykładowe komentarze -->
      <div class="space-y-1.5">
        {#each comments as comment}
          <div
            class="group hover:bg-gray-700/20 rounded-lg py-2 px-2.5 -mx-3 mb-1.5 transition-colors"
          >
            <div class="flex gap-2">
              <div
                class="flex-shrink-0 w-8 h-8 bg-{comment.user
                  .color}-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
              >
                {comment.user.initials}
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex justify-between items-center gap-2">
                  <span class="font-medium text-white text-sm truncate"
                    >{comment.user.name}</span
                  >
                  <span class="text-xs text-gray-500 whitespace-nowrap"
                    >{comment.timestamp}</span
                  >
                </div>
                <p class="text-gray-300 text-sm whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Formularz dodawania komentarza -->
    <div class="p-3 border-t border-gray-700/30 bg-gray-800/20">
      <form class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <textarea
            placeholder="Dodaj komentarz..."
            class="w-full h-10 bg-gray-800/70 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
            rows="1"
          ></textarea>
        </div>
        <div class="flex-shrink-0 self-start">
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 text-sm font-medium transition-colors flex items-center justify-center h-10"
            aria-label="Wyślij komentarz"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
