<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { Plus, Send } from "lucide-svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  // Przykładowe pliki audio dla utworu
  const audioFiles = [
    {
      id: 1,
      name: "Wokal główny - wersja finalna",
      category: "Finał",
      author: "Jan Kowalski",
      date: "19.03.2025",
      duration: 237, // w sekundach
      size: "12.4 MB",
      format: "WAV",
      description: "Ostateczna wersja wokalu głównego po korekcie i kompresji",
    },
    {
      id: 2,
      name: "Demo - pierwsza wersja",
      category: "Demo",
      author: "Anna Nowak",
      date: "15.03.2025",
      duration: 232,
      size: "8.7 MB",
      format: "MP3",
      description: "Pierwsza wersja demo nagrana na próbie",
    },
    {
      id: 3,
      name: "Gitara rytmiczna",
      category: "Instrumenty",
      author: "Tomasz Wieczorek",
      date: "17.03.2025",
      duration: 237,
      size: "15.2 MB",
      format: "WAV",
      description: "Ścieżka gitary rytmicznej nagrana przez Tomka",
    },
    {
      id: 4,
      name: "Bas",
      category: "Instrumenty",
      author: "Karolina Lis",
      date: "18.03.2025",
      duration: 237,
      size: "14.1 MB",
      format: "WAV",
      description: "Ścieżka basu nagrana przez Karolinę",
    },
    {
      id: 5,
      name: "Perkusja",
      category: "Instrumenty",
      author: "Marcin Zieliński",
      date: "16.03.2025",
      duration: 237,
      size: "18.6 MB",
      format: "WAV",
      description: "Ścieżka perkusji nagrana przez Marcina",
    },
    {
      id: 6,
      name: "Mix instrumentalny",
      category: "Finał",
      author: "Jan Kowalski",
      date: "18.03.2025",
      duration: 237,
      size: "16.8 MB",
      format: "WAV",
      description: "Mix wszystkich instrumentów bez wokalu",
    },
    {
      id: 7,
      name: "Wokal - wersja robocza",
      category: "Demo",
      author: "Anna Nowak",
      date: "16.03.2025",
      duration: 235,
      size: "11.2 MB",
      format: "WAV",
      description: "Robocza wersja wokalu przed korektą",
    },
  ];

  // Kategorie plików
  const categories = ["Wszystkie", "Demo", "Instrumenty", "Finał"];
  let selectedCategory = $state("Wszystkie");

  // Stan widoczności panelu komentarzy na urządzeniach mobilnych
  let showMobileComments = $state(false);

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
<div class="flex flex-col lg:flex-row h-full bg-gray-900 overflow-hidden">
  <!-- Główna zawartość z odtwarzaczem na dole -->
  <div
    class="flex-1 flex flex-col overflow-hidden {showMobileComments
      ? 'hidden lg:flex'
      : 'flex'}"
  >
    <!-- Główna zawartość z przewijaniem -->
    <div
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
    >
      <!-- Nagłówek strony -->
      <div class="p-4 sm:p-6">
        <!-- Breadcrumbs i przyciski akcji -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="flex-1">
            <Breadcrumbs project={data.project} recording={data.recording} />
          </div>

          <div
            class="flex flex-col xs:flex-row w-full sm:w-auto gap-2 mt-2 sm:mt-0"
          >
            <!-- Przycisk komentarzy (tylko na mobilnych i tabletach) -->
            <button
              class="lg:hidden flex items-center justify-center gap-2 py-2 px-3 sm:py-1.5 sm:px-2.5 w-full xs:w-auto bg-gray-700/50 hover:bg-gray-700 text-white rounded-md transition-colors"
              onclick={() => (showMobileComments = true)}
              aria-label="Pokaż komentarze"
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
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                ></path>
              </svg>
              <span>Komentarze</span>
              <span
                class="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >{comments.length}</span
              >
            </button>

            <!-- Przycisk dodawania pliku -->
            <button
              class="flex items-center justify-center gap-2 py-2 px-3 sm:py-1.5 sm:px-2.5 w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              aria-label="Dodaj plik"
            >
              <Plus size={18} />
              <span>Dodaj plik</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Główna zawartość strony -->
      <div class="container mx-auto p-4 sm:p-6 max-w-screen-xl">
        <!-- Filtrowanie po kategorii -->
        <div class="mb-6">
          <div class="flex flex-wrap gap-3">
            {#each categories as category}
              <button
                class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory ===
                category
                  ? 'text-white font-semibold'
                  : 'text-gray-400 hover:text-white'}"
                onclick={() => (selectedCategory = category)}
              >
                {category}
                {#if selectedCategory === category}
                  <span
                    class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 mx-auto w-3/4 animate-fadeIn"
                  ></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Lista plików audio -->
        <div class="space-y-3">
          {#each audioFiles.filter((file) => selectedCategory === "Wszystkie" || file.category === selectedCategory) as file}
            <div
              class="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg border border-gray-700/30 transition-all overflow-hidden"
            >
              <!-- Pasek boczny wskazujący kategorię pliku -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1 bg-{file.category ===
                'Demo'
                  ? 'yellow'
                  : file.category === 'Instrumenty'
                    ? 'green'
                    : 'blue'}-600"
              ></div>

              <!-- Główna zawartość -->
              <div class="pl-4 pr-3 py-3">
                <div class="flex items-start">
                  <!-- Format pliku -->
                  <div
                    class="w-12 h-12 mr-3 mt-1 bg-gray-700/50 rounded-md flex items-center justify-center flex-shrink-0"
                  >
                    <div class="text-center font-medium text-sm">
                      {file.format}
                    </div>
                  </div>

                  <!-- Środkowa część z informacjami o pliku -->
                  <div class="flex-grow min-w-0 overflow-hidden pr-3">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <!-- Nazwa pliku -->
                      <h3
                        class="text-base font-medium text-white truncate max-w-full"
                      >
                        {file.name}
                      </h3>
                    </div>

                    <!-- Opis pliku (zawsze widoczny) -->
                    {#if file.description}
                      <p class="text-gray-400 text-sm line-clamp-1 mb-1.5">
                        {file.description}
                      </p>
                    {/if}

                    <!-- Dodatkowe informacje -->
                    <div
                      class="flex items-center text-xs text-gray-400 flex-wrap gap-x-3 gap-y-1.5 mt-1.5"
                    >
                      <!-- Autor -->
                      <span class="flex items-center">
                        <svg
                          class="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        {file.author}
                      </span>

                      <!-- Data dodania -->
                      <span class="flex items-center">
                        <svg
                          class="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        {file.date}
                      </span>

                      <!-- Kategoria -->
                      <!-- class="bg-{file.category === 'Demo'
                          ? 'yellow-300'
                          : file.category === 'Instrumenty'
                            ? 'green'
                            : 'blue'}-500/20 text-{file.category === 'Demo'
                          ? 'yellow-600'
                          : file.category === 'Instrumenty'
                            ? 'green'
                            : 'blue'}-300 px-2 py-0.5 rounded-full" -->
                      <span
                        class="{file.category === 'Demo'
                          ? 'bg-yellow-500/20'
                          : file.category === 'Instrumenty'
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'} {file.category === 'Demo'
                          ? 'text-yellow-400'
                          : file.category === 'Instrumenty'
                            ? 'text-green-400'
                            : 'text-blue-400'} {file.category === 'Demo'
                          ? 'hover:text-yellow-300'
                          : file.category === 'Instrumenty'
                            ? 'hover:text-green-300'
                            : 'hover:text-blue-300'} px-2 py-0.5 rounded-full transition-colors"
                      >
                        {file.category}
                      </span>
                    </div>
                  </div>

                  <!-- Prawa strona z akcjami -->
                  <div class="flex-shrink-0 ml-2 flex items-center">
                    <!-- Pobierz (zawsze widoczny) -->
                    <button
                      class="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-full transition-colors"
                      aria-label="Pobierz plik"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        ></path>
                      </svg>
                    </button>

                    <!-- Więcej opcji (widoczne po najechaniu) -->
                    <!-- <button
                      class="p-2 ml-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Więcej opcji"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        ></path>
                      </svg>
                    </button> -->
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Odtwarzacz audio na dole lewej kolumny -->
    <div
      class="border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center px-5 py-5 sm:py-4 shrink-0"
    >
      <!-- Układ mobilny (flex-col) / Układ desktopowy (flex-row) -->
      <div
        class="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      >
        <!-- Układ mobilny - standardowy -->
        <div class="flex flex-col w-full gap-3 sm:hidden">
          <!-- Informacje o utworze -->
          <div class="flex items-center justify-center">
            <div class="min-w-0 max-w-[250px]">
              <div class="text-white font-medium text-sm truncate">
                {trackInfo.title}
              </div>
              <div class="text-gray-400 text-xs truncate">
                {trackInfo.artist}
              </div>
            </div>
          </div>

          <!-- Pasek postępu -->
          <div class="w-full flex items-center gap-2">
            <span class="text-xs text-gray-400 w-8 text-right"
              >{formatTime(trackInfo.currentTime)}</span
            >
            <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
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
          <div class="flex items-center justify-center gap-5 py-2">
            <!-- Przewiń do tyłu -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Przewiń do tyłu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="11 19 2 12 11 5 11 19"></polygon>
                <polygon points="22 19 13 12 22 5 22 19"></polygon>
              </svg>
            </button>

            <!-- Odtwarzaj/Pauza -->
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3.5 transition-colors"
              aria-label="Odtwarzaj"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
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

            <!-- Przewiń do przodu -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Przewiń do przodu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="13 5 22 12 13 19 13 5"></polygon>
                <polygon points="2 5 11 12 2 19 2 5"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <!-- Układ desktopowy - wszystko w jednej linii -->
        <div class="hidden sm:flex w-full items-center justify-between gap-4">
          <!-- Informacje o utworze -->
          <div class="min-w-0 shrink-0">
            <div class="text-white font-medium text-sm truncate">
              {trackInfo.title}
            </div>
            <div class="text-gray-400 text-xs truncate">{trackInfo.artist}</div>
          </div>

          <!-- Kontrolki i progres zgrupowane razem -->
          <div class="flex flex-1 justify-center max-w-7xl">
            <div class="flex items-center w-full gap-4">
              <!-- Przyciski kontrolne -->
              <div class="flex items-center gap-4 shrink-0">
                <!-- Przewiń do tyłu -->
                <button
                  class="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Przewiń do tyłu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="11 19 2 12 11 5 11 19"></polygon>
                    <polygon points="22 19 13 12 22 5 22 19"></polygon>
                  </svg>
                </button>

                <!-- Odtwarzaj/Pauza -->
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors"
                  aria-label="Odtwarzaj"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
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

                <!-- Przewiń do przodu -->
                <button
                  class="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Przewiń do przodu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="13 5 22 12 13 19 13 5"></polygon>
                    <polygon points="2 5 11 12 2 19 2 5"></polygon>
                  </svg>
                </button>
              </div>

              <!-- Pasek postępu -->
              <div class="flex-1 flex items-center gap-3">
                <span class="text-sm text-gray-400 w-12 text-right"
                  >{formatTime(trackInfo.currentTime)}</span
                >
                <div
                  class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-blue-500"
                    style="width: {(trackInfo.currentTime /
                      trackInfo.duration) *
                      100}%"
                  ></div>
                </div>
                <span class="text-sm text-gray-400 w-12"
                  >{formatTime(trackInfo.duration)}</span
                >
              </div>
            </div>
          </div>

          <!-- Pusty element dla zachowania układu -->
          <div class="shrink-0 hidden lg:block"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Panel komentarzy -->
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
