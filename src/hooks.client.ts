import type { HandleFetch } from "@sveltejs/kit";

/**
 * Hook SvelteKit do modyfikacji zapytań fetch
 * Automatycznie dodaje credentials: 'include' do zapytań API (poza auth)
 */
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  const url = new URL(request.url);
  const isApiRequest = url.pathname.startsWith("/api/");
  const isAuthRequest = url.pathname.startsWith("/api/auth/");

  // Automatycznie dodaj credentials dla zapytań API (poza auth)
  if (isApiRequest && !isAuthRequest) {
    // Tworzymy nowy obiekt Request z oryginalnymi danymi
    const newRequest = new Request(request);

    // Dodajemy opcję credentials
    const options: RequestInit = {
      credentials: "include",
    };

    return fetch(newRequest, options);
  }

  // Dla pozostałych zapytań użyj oryginalnego zapytania
  return fetch(request);
};
