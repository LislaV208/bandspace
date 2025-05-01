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
    console.log("Reset password request received");

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

    const { email } = body;
    console.log("Reset password attempt for email:", email);

    if (!email) {
      return json(
        { success: false, error: "Email jest wymagany" },
        { status: 400 }
      );
    }

    // Pobierz bazowy URL z aktualnego żądania
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // Wywołaj metodę resetPasswordForEmail z Supabase
    console.log("Calling Supabase auth.resetPasswordForEmail");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${baseUrl}/auth/update-password`,
      }
    );

    if (resetError) {
      console.error("Reset password error:", resetError);

      // Mapowanie komunikatów błędów na przyjazne dla użytkownika komunikaty w języku polskim
      let userFriendlyError = "Wystąpił błąd podczas resetowania hasła";

      if (resetError.message.includes("User not found")) {
        userFriendlyError =
          "Nie znaleziono użytkownika o podanym adresie email";
      } else if (resetError.message.includes("Invalid email")) {
        userFriendlyError = "Nieprawidłowy format adresu email";
      } else if (resetError.message.includes("Too many requests")) {
        userFriendlyError =
          "Zbyt wiele prób resetowania hasła. Spróbuj ponownie później.";
      }

      console.log("Returning error response:", userFriendlyError);
      return json(
        { success: false, error: userFriendlyError },
        { status: 400 }
      );
    }

    console.log("Reset password email sent successfully");

    // Zwracamy sukces
    return json({
      success: true,
      message: "Link do resetowania hasła został wysłany na podany adres email",
    });
  } catch (err) {
    console.error("Error in reset password endpoint:", err);
    return json(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas resetowania hasła",
      },
      { status: 500 }
    );
  }
};
