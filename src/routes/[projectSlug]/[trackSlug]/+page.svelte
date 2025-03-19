<script lang="ts">
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import UserAvatar from "$lib/components/UserAvatar.svelte";
  import type { TrackCategory } from "$lib/types/track_category";
  import { format } from "date-fns";
  import { Plus, Send } from "lucide-svelte";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const {
    supabase,
    track: { files },
  } = data;

  const { categories } = data;

  let comments = $state(data.track.comments || []);

  let selectedCategory: TrackCategory | null = $state(null);
  let selectedFile = $state(files.find((file) => file.is_primary));

  let commentInputValue = $state("");
  let commentError = $state<string | null>(null);

  let showMobileComments = $state(false);

  // Stan odtwarzacza audio
  let audioElement: HTMLAudioElement | null = $state(null);
  let isPlaying = $state(false);
  let audioUrl = $state<string | null>(null);
  let currentTime = $state(0); // Aktualny czas w sekundach
  let duration = $state(0); // Całkowita długość utworu w sekundach
  let progress = $state(0); // Postęp odtwarzania (0-1)
  let tempTime = $state<number | null>(null); // Tymczasowy czas przy przewijaniu
  let seekInterval = $state<number | null>(null); // Identyfikator interwału przewijania
  let isSeeking = $state(false); // Flaga wskazująca, czy użytkownik aktualnie przewija

  async function handleAddComment() {
    if (!commentInputValue.trim()) return;

    commentError = null;

    try {
      const response = await fetch(`/api/tracks/${data.track.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentInputValue.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się dodać komentarza");
      }

      const newComment = await response.json();

      comments = [...comments, newComment];

      commentInputValue = "";
    } catch (err) {
      if (err instanceof Error) {
        commentError = err.message;
      } else {
        commentError = "Wystąpił nieznany błąd podczas dodawania komentarza";
      }
      console.error("Błąd dodawania komentarza:", err);
    }
  }

  async function loadAudio() {
    if (!selectedFile) return;

    isPlaying = false;

    // Jeśli istnieje poprzedni element audio, zatrzymaj go
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
    }

    try {
      const { data: audio, error: audioError } = await supabase.storage
        .from("project_files")
        .createSignedUrl(selectedFile.storage_path, 3600);

      if (audioError) {
        throw new Error(audioError.message || "Nie udało się załadować audio");
      }

      audioUrl = audio.signedUrl;

      // Tworzenie nowego elementu audio
      audioElement = new Audio(audioUrl);

      // Dodanie obsługi zdarzeń
      audioElement.addEventListener("loadedmetadata", () => {
        duration = audioElement ? audioElement.duration : 0;
        console.log("Długość utworu:", duration);
      });

      // Funkcja aktualizująca czas
      const updateTimeDisplay = () => {
        if (audioElement && !isSeeking) {
          // Aktualizuj tylko gdy użytkownik nie przewija
          currentTime = audioElement.currentTime;
          progress = duration > 0 ? currentTime / duration : 0;
        }
      };

      // Dodaj nasłuchiwanie na zdarzenie timeupdate
      audioElement.addEventListener("timeupdate", updateTimeDisplay);

      audioElement.addEventListener("ended", () => {
        isPlaying = false;
        progress = 0;
        currentTime = 0;
      });

      audioElement.addEventListener("error", (e) => {
        console.error("Błąd odtwarzania audio:", e);
        toast.error("Wystąpił błąd podczas odtwarzania pliku audio", {
          position: "bottom-right",
        });
        isPlaying = false;
      });

      toast.success("Plik audio załadowany pomyślnie", {
        position: "bottom-right",
      });
    } catch (err) {
      console.error("Błąd podczas ładowania audio:", err);
      toast.error(
        err instanceof Error ? err.message : "Nie udało się załadować audio",
        {
          position: "bottom-right",
        }
      );
    }
  }

  // Funkcja do odtwarzania/pauzowania audio
  function togglePlayPause() {
    if (!audioElement) {
      loadAudio();
      return;
    }

    if (isPlaying) {
      audioElement.pause();
      isPlaying = false;
    } else {
      audioElement.play().catch((err) => {
        console.error("Błąd odtwarzania:", err);
        toast.error("Nie można odtworzyć pliku audio", {
          position: "bottom-right",
        });
      });
      isPlaying = true;
    }
  }

  // Zmienne do śledzenia stanu przycisków
  let seekDirection = $state<number | null>(null); // -1 dla przewijania w tył, 1 dla przewijania w przód, null gdy brak
  let seekStartTime = $state<number | null>(null); // Czas rozpoczęcia przytrzymania przycisku
  let clickTimeout = $state<number | null>(null); // Timeout dla rozróżnienia kliknięcia od przytrzymania

  // Zmienne do obsługi paska postępu
  let isDraggingProgress = $state(false); // Czy użytkownik przeciąga pasek postępu
  let wasPlayingBeforeDrag = $state(false); // Czy odtwarzanie było aktywne przed rozpoczęciem przeciągania

  // Funkcja do obsługi naciśnięcia przycisku przewijania
  function handleSeekStart(direction: number, e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    if (e instanceof TouchEvent) e.preventDefault();

    if (!audioElement || duration <= 0) return;

    // Zapisz kierunek przewijania i czas rozpoczęcia
    seekDirection = direction;
    seekStartTime = Date.now();

    // Ustaw timeout, aby rozróżnić kliknięcie od przytrzymania
    if (clickTimeout) clearTimeout(clickTimeout);

    clickTimeout = setTimeout(() => {
      // Jeśli przycisk jest nadal wciśnięty po 200ms, rozpocznij ciągłe przewijanie
      if (seekDirection !== null && seekStartTime !== null) {
        // Zatrzymaj poprzedni interwał jeśli istnieje
        if (seekInterval !== null) {
          clearInterval(seekInterval);
          seekInterval = null;
        }

        // Ustaw flagę przewijania
        isSeeking = true;

        // Ustaw tymczasowy czas na aktualny czas
        tempTime = audioElement?.currentTime ?? 0;

        // Rozpocznij interwał przewijania
        seekInterval = setInterval(() => {
          if (tempTime !== null) {
            // Aktualizuj tymczasowy czas (0.5 sekundy na każde 100ms dla płynności)
            tempTime = Math.max(
              0,
              Math.min(duration, tempTime + direction * 0.5)
            );

            // Aktualizuj wyświetlany czas i pasek postępu bez zmiany faktycznego czasu odtwarzania
            currentTime = tempTime;
            progress = duration > 0 ? tempTime / duration : 0;
          }
        }, 100) as unknown as number;
      }
    }, 200) as unknown as number;
  }

  // Funkcja do obsługi zwolnienia przycisku przewijania
  function handleSeekEnd(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    if (e instanceof TouchEvent) e.preventDefault();

    if (!audioElement || duration <= 0) return;

    // Sprawdź, czy było to kliknięcie czy przytrzymanie
    const wasClick = seekStartTime !== null && Date.now() - seekStartTime < 200;

    // Wyczyść timeout jeśli istnieje
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Zatrzymaj interwał jeśli istnieje
    if (seekInterval !== null) {
      clearInterval(seekInterval);
      seekInterval = null;

      // Jeśli było to przytrzymanie, zastosuj tymczasowy czas
      if (tempTime !== null && !wasClick) {
        audioElement.currentTime = tempTime;
        tempTime = null;
      }

      // Resetuj flagę przewijania
      isSeeking = false;
    }
    // Jeśli było to kliknięcie, przewiń o 5 sekund
    else if (wasClick && seekDirection !== null) {
      const seconds = seekDirection * 5; // 5 sekund w odpowiednim kierunku
      const newTime = Math.max(
        0,
        Math.min(duration, audioElement.currentTime + seconds)
      );
      audioElement.currentTime = newTime;
    }

    // Resetuj zmienne
    seekDirection = null;
    seekStartTime = null;
  }

  // Funkcje do obsługi paska postępu
  function handleProgressBarStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioElement || duration <= 0) return;
    
    // Zapisz, czy odtwarzanie było aktywne przed rozpoczęciem przeciągania
    wasPlayingBeforeDrag = !audioElement.paused;
    
    // Ustaw flagę przeciągania i przewijania
    isDraggingProgress = true;
    isSeeking = true;
    
    // Nie zatrzymujemy odtwarzania podczas przeciągania
    // Odtwarzanie będzie kontynuowane w czasie rzeczywistym
    
    // Zapisz referencję do paska postępu
    progressBarElement = e.currentTarget as HTMLElement;
    
    // Aktualizuj pozycję na podstawie kliknięcia/dotknięcia
    let clientX: number;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else {
      // TouchEvent
      clientX = e.touches[0].clientX;
    }
    updateProgressBarPosition(clientX);
    
    // Dodaj klasę CSS do ciała dokumentu, aby zapobiec zaznaczaniu tekstu
    document.body.classList.add("no-select");
    
    // Dodaj globalne nasłuchiwanie zdarzeń
    document.addEventListener("mousemove", handleProgressBarMove);
    document.addEventListener("mouseup", handleProgressBarEnd);
    document.addEventListener("touchmove", handleProgressBarMove, { passive: false });
    document.addEventListener("touchend", handleProgressBarEnd);
    document.addEventListener("touchcancel", handleProgressBarEnd);
  }
  
  function handleProgressBarMove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDraggingProgress) {
      let clientX: number;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        // TouchEvent
        clientX = e.touches[0].clientX;
      }
      updateProgressBarPosition(clientX);
    }
  }
  
  function handleProgressBarEnd(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDraggingProgress) return;
    
    // Aktualizuj ostateczną pozycję
    let clientX: number;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // TouchEvent - używamy changedTouches dla touchend
      clientX = e.changedTouches[0].clientX;
    } else {
      // Jeśli nie możemy uzyskać pozycji, po prostu kończymy
      clientX = 0;
    }
    
    // Tylko jeśli mamy poprawną pozycję X
    if (clientX > 0) {
      updateProgressBarPosition(clientX);
    }
    
    // Zastosuj nową pozycję
    if (tempTime !== null && audioElement) {
      audioElement.currentTime = tempTime;
      tempTime = null;
    }
    
    // Resetuj flagi
    isDraggingProgress = false;
    isSeeking = false;
    progressBarElement = null; // Resetuj referencję do paska postępu
    
    // Nie musimy wznawiać odtwarzania, ponieważ go nie zatrzymaliśmy
    
    // Usuń klasę CSS z ciała dokumentu
    document.body.classList.remove("no-select");
    
    // Usuń globalne nasłuchiwanie zdarzeń
    document.removeEventListener("mousemove", handleProgressBarMove);
    document.removeEventListener("mouseup", handleProgressBarEnd);
    document.removeEventListener("touchmove", handleProgressBarMove);
    document.removeEventListener("touchend", handleProgressBarEnd);
    document.removeEventListener("touchcancel", handleProgressBarEnd);
  }
  
  // Zmienna do przechowywania referencji do paska postępu
  let progressBarElement: HTMLElement | null = null;

  function updateProgressBarPosition(clientX: number) {
    if (!audioElement || !isDraggingProgress || !progressBarElement) return;
    
    // Pobierz wymiary paska postępu
    const progressBarRect = progressBarElement.getBoundingClientRect();
    
    // Oblicz pozycję względną (0-1)
    const relativePosition = Math.max(0, Math.min(1, (clientX - progressBarRect.left) / progressBarRect.width));
    
    // Oblicz nowy czas na podstawie pozycji
    tempTime = relativePosition * duration;
    
    // Aktualizuj wyświetlany czas i pasek postępu
    currentTime = tempTime;
    progress = relativePosition;
  }

  // Ładowanie audio przy pierwszym renderowaniu
  onMount(() => {
    if (selectedFile) {
      loadAudio();
    }
  });

  // Usunięcie efektu, który powodował zapętlenie

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
            <Breadcrumbs project={data.project} track={data.track} />
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
            <button
              class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory ===
              null
                ? 'text-white font-semibold'
                : 'text-gray-400 hover:text-white'}"
              onclick={() => (selectedCategory = null)}
            >
              Wszystkie
              {#if selectedCategory === null}
                <span
                  class="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 mx-auto w-3/4 animate-fadeIn"
                ></span>
              {/if}
            </button>
            {#each categories as category}
              <button
                class="relative px-4 py-2 rounded-full text-sm transition-all {selectedCategory?.id ===
                category.id
                  ? 'text-white font-semibold'
                  : 'text-gray-400 hover:text-white'}"
                onclick={() => (selectedCategory = category)}
              >
                {category.name}
                {#if selectedCategory?.id === category.id}
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
          {#each files.filter((file) => selectedCategory === null || file.category.id === selectedCategory.id) as file}
            <div
              class="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg border border-gray-700/30 transition-all overflow-hidden cursor-pointer"
              onclick={() => {
                if (selectedFile?.id !== file.id) {
                  selectedFile = file;
                  loadAudio();
                }
              }}
              aria-label="Wybierz plik"
              role="button"
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (selectedFile?.id !== file.id) {
                    selectedFile = file;
                    loadAudio();
                  }
                }
              }}
            >
              <!-- Pasek boczny wskazujący czy plik jest wybrany -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1 {selectedFile?.id ===
                file.id
                  ? 'bg-blue-400'
                  : ''}"
              ></div>

              <!-- Główna zawartość -->
              <div class="pl-4 pr-3 py-3">
                <div class="flex items-start">
                  <!-- Format pliku -->
                  <div
                    class="w-12 h-12 mr-3 mt-1 bg-gray-700/50 rounded-md flex items-center justify-center flex-shrink-0"
                  >
                    <div class="text-center font-medium text-sm">
                      {file.file_name.split(".").pop()}
                    </div>
                  </div>

                  <!-- Środkowa część z informacjami o pliku -->
                  <div class="flex-grow min-w-0 overflow-hidden pr-3">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <!-- Nazwa pliku -->
                      <h3
                        class="text-base font-medium text-white truncate max-w-full"
                      >
                        {file.file_name}
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
                        {file.uploaded_by.name}
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
                        {format(new Date(file.created_at), "dd-MM-yyyy")}
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
                        class="bg-blue-500/20 text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded-full transition-colors"
                      >
                        {file.category.name}
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
      class="border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center px-5 py-2 sm:py-4 shrink-0"
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
                {selectedFile?.file_name}
              </div>
              <div class="text-gray-400 text-xs truncate">
                {data.project.name}
              </div>
            </div>
          </div>

          <!-- Pasek postępu -->
          <div class="w-full flex items-center gap-2">
            <span class="text-xs text-gray-400 w-8 text-right"
              >{formatTime(currentTime)}</span
            >
            <div
              class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer"
              role="slider"
              aria-label="Pasek postępu utworu"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(progress * 100)}
              tabindex="0"
              onmousedown={(e) => handleProgressBarStart(e)}
              onmousemove={(e) => handleProgressBarMove(e)}
              onmouseup={(e) => handleProgressBarEnd(e)}
              onmouseleave={(e) => handleProgressBarEnd(e)}
              ontouchstart={(e) => handleProgressBarStart(e)}
              ontouchmove={(e) => handleProgressBarMove(e)}
              ontouchend={(e) => handleProgressBarEnd(e)}
              ontouchcancel={(e) => handleProgressBarEnd(e)}
            >
              <div
                class="h-full bg-blue-500"
                style="width: {progress * 100}%"
              ></div>
            </div>
            <span class="text-xs text-gray-400 w-8">{formatTime(duration)}</span
            >
          </div>

          <!-- Przyciski kontrolne -->
          <div class="flex items-center justify-center gap-5 py-2">
            <!-- Przewiń do tyłu -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Przewiń do tyłu"
              onmousedown={(e) => handleSeekStart(-1, e)}
              onmouseup={(e) => handleSeekEnd(e)}
              onmouseleave={(e) => handleSeekEnd(e)}
              ontouchstart={(e) => handleSeekStart(-1, e)}
              ontouchend={(e) => handleSeekEnd(e)}
              ontouchcancel={(e) => handleSeekEnd(e)}
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
              aria-label={isPlaying ? "Pauza" : "Odtwarzaj"}
              onclick={togglePlayPause}
            >
              {#if isPlaying}
                <!-- Ikona pauzy -->
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
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              {:else}
                <!-- Ikona odtwarzania -->
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
              {/if}
            </button>

            <!-- Przewiń do przodu -->
            <button
              class="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Przewiń do przodu"
              onmousedown={(e) => handleSeekStart(1, e)}
              onmouseup={(e) => handleSeekEnd(e)}
              onmouseleave={(e) => handleSeekEnd(e)}
              ontouchstart={(e) => handleSeekStart(1, e)}
              ontouchend={(e) => handleSeekEnd(e)}
              ontouchcancel={(e) => handleSeekEnd(e)}
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
              {selectedFile?.file_name}
            </div>
            <div class="text-gray-400 text-xs truncate">
              {data.project.name}
            </div>
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
                  onmousedown={(e) => handleSeekStart(-1, e)}
                  onmouseup={(e) => handleSeekEnd(e)}
                  onmouseleave={(e) => handleSeekEnd(e)}
                  ontouchstart={(e) => handleSeekStart(-1, e)}
                  ontouchend={(e) => handleSeekEnd(e)}
                  ontouchcancel={(e) => handleSeekEnd(e)}
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
                  aria-label={isPlaying ? "Pauza" : "Odtwarzaj"}
                  onclick={togglePlayPause}
                >
                  {#if isPlaying}
                    <!-- Ikona pauzy -->
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
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  {:else}
                    <!-- Ikona odtwarzania -->
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
                  {/if}
                </button>

                <!-- Przewiń do przodu -->
                <button
                  class="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Przewiń do przodu"
                  onmousedown={(e) => handleSeekStart(1, e)}
                  onmouseup={(e) => handleSeekEnd(e)}
                  onmouseleave={(e) => handleSeekEnd(e)}
                  ontouchstart={(e) => handleSeekStart(1, e)}
                  ontouchend={(e) => handleSeekEnd(e)}
                  ontouchcancel={(e) => handleSeekEnd(e)}
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

              <!-- Wyświetlanie czasu i pasek postępu -->
              <div class="flex-1 flex items-center gap-3">
                <span class="text-sm text-gray-400 w-12 text-right"
                  >{formatTime(currentTime)}</span
                >
                <div
                  class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer"
                  role="slider"
                  aria-label="Pasek postępu utworu"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={Math.round(progress * 100)}
                  tabindex="0"
                  onmousedown={(e) => handleProgressBarStart(e)}
                  ontouchstart={(e) => handleProgressBarStart(e)}
                >
                  <div
                    class="h-full bg-blue-500"
                    style="width: {progress * 100}%"
                  ></div>
                </div>
                <span class="text-sm text-gray-400 w-12"
                  >{formatTime(duration)}</span
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
      <div class="space-y-0">
        {#each comments as comment, index}
          <div
            class="group hover:bg-gray-700/40 rounded-lg py-2.5 px-3 -mx-3 transition-colors"
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
            placeholder="Dodaj komentarz..."
            class="w-full h-10 bg-gray-800/70 border border-gray-700/50 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
            rows="1"
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
</div>

<style>
  /* Styl zapobiegający zaznaczaniu tekstu podczas przeciągania paska postępu */
  :global(.no-select) {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
</style>
