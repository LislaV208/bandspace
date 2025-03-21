<script lang="ts">
  import { onDestroy } from "svelte";
  import toast from "svelte-french-toast";

  const { audioUrl = $bindable() }: { audioUrl: string | null } = $props();

  // Stan odtwarzacza audio

  let currentAudioUrl = $state<string | null>(null);
  let audioElement: HTMLAudioElement | null = $state(null);
  let isPlaying = $state(false);
  let currentTime = $state(0); // Aktualny czas w sekundach
  let duration = $state(0); // Całkowita długość utworu w sekundach
  let progress = $state(0); // Postęp odtwarzania (0-1)
  let tempTime = $state<number | null>(null); // Tymczasowy czas przy przewijaniu
  let seekInterval = $state<number | null>(null); // Identyfikator interwału przewijania
  let isSeeking = $state(false); // Flaga wskazująca, czy użytkownik aktualnie przewija

  // Zmienne do śledzenia stanu przycisków
  let seekDirection = $state<number | null>(null); // -1 dla przewijania w tył, 1 dla przewijania w przód, null gdy brak
  let seekStartTime = $state<number | null>(null); // Czas rozpoczęcia przytrzymania przycisku
  let clickTimeout = $state<number | null>(null); // Timeout dla rozróżnienia kliknięcia od przytrzymania

  // Zmienne do obsługi paska postępu
  let isDraggingProgress = $state(false); // Czy użytkownik przeciąga pasek postępu
  let wasPlayingBeforeDrag = $state(false); // Czy odtwarzanie było aktywne przed rozpoczęciem przeciągania

  $effect(() => {
    if (audioUrl && audioUrl !== currentAudioUrl) {
      currentAudioUrl = audioUrl;
      loadAudio();
    }
  });

  // Funkcja do zatrzymywania odtwarzania audio przy opuszczeniu strony
  onDestroy(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
      isPlaying = false;
    }

    // Czyszczenie interwałów, jeśli istnieją
    if (seekInterval !== null) {
      clearInterval(seekInterval);
      seekInterval = null;
    }
  });

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  async function loadAudio() {
    if (!audioUrl) return;

    isPlaying = false;

    // Jeśli istnieje poprzedni element audio, zatrzymaj go
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
    }

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
  }

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
    document.addEventListener("touchmove", handleProgressBarMove, {
      passive: false,
    });
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
    const relativePosition = Math.max(
      0,
      Math.min(1, (clientX - progressBarRect.left) / progressBarRect.width)
    );

    // Oblicz nowy czas na podstawie pozycji
    tempTime = relativePosition * duration;

    // Aktualizuj wyświetlany czas i pasek postępu
    currentTime = tempTime;
    progress = relativePosition;
  }
</script>

<div
  class="border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center px-5 py-2 sm:py-4 shrink-0"
>
  <!-- Układ mobilny (flex-col) / Układ desktopowy (flex-row) -->
  <div class="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
    <!-- Układ mobilny - standardowy -->
    <div class="flex flex-col w-full gap-3 sm:hidden">
      <!-- Informacje o utworze -->
      <!-- <div class="flex items-center justify-center">
        <div class="min-w-0 max-w-[250px]">
          <div class="text-white font-medium text-sm truncate">
            {selectedFile()?.file_name}
          </div>
          <div class="text-gray-400 text-xs truncate">
            {data.project.name}
          </div>
        </div>
      </div> -->

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
        <span class="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
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
      <!-- <div class="min-w-0 shrink-0">
        <div class="text-white font-medium text-sm truncate">
          {selectedFile()?.file_name}
        </div>
        <div class="text-gray-400 text-xs truncate">
          {data.project.name}
        </div>
      </div> -->

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
