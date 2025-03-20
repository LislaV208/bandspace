# Funkcjonalności BandSpace

## 1. Autentykacja i zarządzanie użytkownikami
- **Logowanie**
  - Logowanie za pomocą adresu e-mail i hasła
  - Integracja z Google OAuth
  - Przekierowanie po logowaniu do poprzednio odwiedzanej strony
- **Rejestracja**
  - Rejestracja za pomocą adresu e-mail i hasła
  - Rejestracja przez Google
- **Zarządzanie profilem**
  - Wyświetlanie podstawowych informacji o użytkowniku
  - Menu użytkownika z opcją wylogowania

## 2. Zarządzanie projektami
- **Tworzenie projektów**
  - Tworzenie nowych projektów z unikalnymi nazwami
  - Automatyczne generowanie unikalnych slugów dla projektów
- **Przeglądanie projektów**
  - Lista projektów użytkownika na stronie głównej
  - Wyświetlanie daty aktualizacji projektu
  - Wyświetlanie liczby użytkowników w projekcie
- **Zarządzanie projektami**
  - Usuwanie projektów
  - Opuszczanie projektów przez uczestnika

## 3. Współpraca
- **System zaproszeń**
  - Generowanie unikalnych linków z tokenami do projektów
  - Ograniczony czas ważności zaproszeń
  - Kopiowanie linku zaproszenia do schowka
- **Udostępnianie projektów**
  - Dołączanie do projektu poprzez link zaproszenia
  - Wyświetlanie uczestników projektu

## 4. Zarządzanie plikami audio
- **Przesyłanie plików**
  - Przesyłanie plików audio (MP3, WAV, itp.)
  - Obsługa przeciągania i upuszczania plików (drag & drop)
  - Walidacja typów plików (tylko pliki audio)
- **Przeglądanie utworów**
  - Lista utworów w projekcie
  - Informacje o dacie dodania i użytkowniku, który przesłał utwór
- **Operacje na utworach**
  - Odtwarzanie utworów
  - Usuwanie utworów

## 5. Interfejs użytkownika
- **Nawigacja**
  - Pasek nawigacyjny na górze strony
  - System okruchów chleba (breadcrumbs) do nawigacji
  - Responsywny design (mobile, tablet, desktop)
- **Powiadomienia**
  - Komunikaty o sukcesie operacji
  - Komunikaty o błędach
  - Wyświetlanie stanu ładowania podczas operacji
- **Modale**
  - Modal tworzenia projektu
  - Modal usuwania projektu
  - Modal opuszczania projektu
  - Modal dodawania pliku audio
  - Modal udostępniania projektu

## 6. Bezpieczeństwo
- **Kontrola dostępu**
  - Ochrona stron przed dostępem osób niezalogowanych
  - Przekierowanie do strony logowania z zapisaniem oryginalnego URL
  - Sprawdzanie uprawnień do projektu

## 7. Przechowywanie danych
- **Baza danych**
  - Tabela użytkowników (users)
  - Tabela projektów (projects)
  - Tabela przypisania użytkowników do projektów (projects_users)
  - Tabela utworów (tracks)
  - Tabela zaproszeń do projektów (project_invites)
- **Przechowywanie plików**
  - Przechowywanie plików audio w Supabase Storage
  - Unikalny ścieżki przechowywania plików

## 8. Profil użytkownika
- Edycja nazwy użytkownika

## 9. Komentarze do utworu
- Dodawanie komentarzy do utworu

## 10. Przypisanie wielu plików do utworu
- Modyfikacja struktury bazy danych umożliwiająca przechowywanie wielu plików dla jednego utworu
- Implementacja podstawowej kategoryzacji plików
- Interfejs listy plików dla utworu z podstawowymi informacjami 
- Możliwość odtwarzania każdego pliku bezpośrednio w aplikacji
- Oznaczanie pliku jako "głównego" dla utworu
- Filtrowanie plików po kategorii


## BACKLOG:
  - komentarze do utworu - ulepszenie


### Przypisanie wielu plików do utworu
#### Priorytet 2 (Przydatne)
- Rozszerzona kategoryzacja plików (podkategorie instrumentów, fragmenty, próby, mix/master)
- Komentarze do poszczególnych plików (nie tylko do głównego utworu)
- Filtrowanie plików po dacie, autorze
- Sortowanie listy plików według różnych kryteriów
- Dodatkowe metadane plików (tempo, tonacja, długość)

#### Priorytet 3 (Opcjonalne)
- Timeline pokazująca ewolucję utworu
- System tagowania plików (własne tagi użytkownika)
- Narzędzie do porównywania wersji plików
- Statystyki odtworzeń plików
- System powiadomień o nowych plikach
- Prosty edytor audio online

