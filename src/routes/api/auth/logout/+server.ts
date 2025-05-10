import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Endpoint do wylogowania użytkownika.
 * Obsługuje żądanie POST bez dodatkowych parametrów.
 */
export const POST: RequestHandler = async ({ locals }) => {
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
    console.log("Logout request received");

    // Wywołanie metody signOut z Supabase
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.error("Logout error:", logoutError);
      return json(
        { 
          success: false, 
          error: "Wystąpił błąd podczas wylogowywania" 
        }, 
        { status: 500 }
      );
    }

    // Zwracamy informację o powodzeniu
    return json({
      success: true,
      message: "Wylogowano pomyślnie"
    });
  } catch (err) {
    console.error("Error in logout endpoint:", err);
    return json(
      {
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas wylogowywania",
      },
      { status: 500 }
    );
  }
};
