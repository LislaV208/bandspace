import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Sprawdź, czy supabase jest dostępny
    if (!locals.supabase) {
      console.error("Supabase client is not available in locals");
      return json(
        {
          success: false,
          error: "Błąd konfiguracji serwera. Spróbuj ponownie później.",
        },
        { status: 500 }
      );
    }

    const supabase = locals.supabase;

    // Logowanie informacji o żądaniu
    console.log("Login request received");

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return json(
        {
          success: false,
          error: "Nieprawidłowy format danych",
        },
        { status: 400 }
      );
    }

    const { email, password } = body;
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return json(
        { success: false, error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    console.log("Calling Supabase auth.signInWithPassword");
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Login error:", authError);

      // Mapowanie komunikatów błędów na przyjazne dla użytkownika komunikaty w języku polskim
      let userFriendlyError = "Wystąpił błąd podczas logowania";

      if (authError.message.includes("Invalid login credentials")) {
        userFriendlyError = "Nieprawidłowy email lub hasło";
      } else if (authError.message.includes("Email not confirmed")) {
        userFriendlyError =
          "Adres email nie został potwierdzony. Sprawdź swoją skrzynkę email.";
      } else if (authError.message.includes("Too many requests")) {
        userFriendlyError =
          "Zbyt wiele prób logowania. Spróbuj ponownie później.";
      } else if (authError.message.includes("User not found")) {
        userFriendlyError =
          "Nie znaleziono użytkownika o podanym adresie email";
      } else if (authError.message.includes("Invalid email")) {
        userFriendlyError = "Nieprawidłowy format adresu email";
      }

      console.log("Returning error response:", userFriendlyError);
      return json(
        { success: false, error: userFriendlyError },
        { status: 401 }
      );
    }

    console.log("Login successful, returning session");

    // Zwracamy pełne obiekty user i session
    return json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("Error in login endpoint:", err);
    return json(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas logowania",
      },
      { status: 500 }
    );
  }
};
