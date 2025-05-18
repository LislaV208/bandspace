import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import { AuthError } from "@supabase/supabase-js";

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  // Sprawdzamy, czy żądanie pochodzi z API
  const isApiRequest = event.url.pathname.startsWith("/api");

  // Sprawdzamy, czy to jest publiczny endpoint API
  const isPublicApiEndpoint = event.url.pathname.startsWith("/api/auth");

  // Dla wszystkich żądań najpierw sprawdzamy sesję z cookies
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Jeśli nie mamy sesji z cookies, a to jest żądanie API, sprawdzamy nagłówek Authorization
  if (!session && isApiRequest && !isPublicApiEndpoint) {
    const authHeader = event.request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const { data, error } = await event.locals.supabase.auth.getUser(token);
        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new AuthError("User not found");
        }

        event.locals.user = data.user;

        // Pobieramy sesję na podstawie tokenu
        const { data: sessionData } =
          await event.locals.supabase.auth.getSession();
        event.locals.session = sessionData.session;

        return resolve(event);
      } catch (error) {
        console.error("Błąd weryfikacji tokenu JWT:", error);
        return new Response(
          JSON.stringify({
            error: "Nieautoryzowany dostęp",
            message: "Wymagane uwierzytelnienie",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
  }

  // Dla żądań API
  if (isApiRequest) {
    // Jeśli to publiczny endpoint API, pozwalamy na dostęp
    if (isPublicApiEndpoint) {
      return resolve(event);
    }

    // Dla niepublicznych endpointów API wymagamy ważnej sesji
    if (!event.locals.session) {
      return new Response(
        JSON.stringify({
          error: "Nieautoryzowany dostęp",
          message: "Wymagane uwierzytelnienie",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Jeśli sesja jest ważna, kontynuujemy
    return resolve(event);
  }

  // Dla żądań nie-API (aplikacja webowa)
  if (
    !event.locals.session &&
    !event.url.pathname.startsWith("/auth") &&
    !event.url.pathname.startsWith("/api/auth")
  ) {
    console.log("redirecting to homepage for login");
    // Zapisujemy bieżący URL jako parametr redirect
    const currentPath = event.url.pathname + event.url.search;
    // Enkodujemy URL, aby uniknąć problemów z znakami specjalnymi
    const encodedPath = encodeURIComponent(currentPath);
    // Przekierowujemy do strony głównej z parametrem redirect
    redirect(303, `/?redirect=${encodedPath}`);
  }

  if (event.locals.session) {
    // Jeśli użytkownik jest zalogowany i próbuje wejść na stronę główną lub ścieżkę autoryzacji, przekieruj go do dashboardu
    if (event.url.pathname === "/" || event.url.pathname.startsWith("/auth")) {
      console.log("redirecting to /dashboard");
      redirect(303, "/dashboard");
    }
  }

  return resolve(event);
};

// Middleware do obsługi CORS
const cors: Handle = async ({ event, resolve }) => {
  // Sprawdź, czy żądanie dotyczy API
  const isApiRequest = event.url.pathname.startsWith("/api");

  // Obsługa żądań OPTIONS (preflight) dla API
  if (isApiRequest && event.request.method === "OPTIONS") {
    // Zwróć odpowiedź 204 No Content dla żądań OPTIONS
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Accept, X-Requested-With, X-Client-Info",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Expose-Headers":
          "Content-Range, X-Supabase-Api-Version",
      },
    });
  }

  // Przygotuj odpowiedź dla innych żądań
  const response = await resolve(event);

  // Dodaj nagłówki CORS tylko dla żądań API
  if (isApiRequest) {
    // Dodaj nagłówki CORS
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, X-Requested-With, X-Client-Info"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Expose-Headers",
      "Content-Range, X-Supabase-Api-Version"
    );
  }

  return response;
};

export const handle: Handle = sequence(cors, supabase, authGuard);
