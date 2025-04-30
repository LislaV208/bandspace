import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Endpoint do zmiany hasła użytkownika.
 * Obsługuje żądanie POST z aktualnym i nowym hasłem.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Sprawdź czy użytkownik jest zalogowany
  const { user, supabase } = locals;

  if (!user || !supabase) {
    throw error(401, { message: 'Nie jesteś zalogowany' });
  }

  // Pobierz dane z żądania
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw error(400, { message: 'Nieprawidłowy format danych' });
  }

  // Walidacja danych
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    throw error(400, { message: 'Aktualne i nowe hasło są wymagane' });
  }

  if (newPassword.length < 8) {
    throw error(400, { message: 'Nowe hasło musi mieć co najmniej 8 znaków' });
  }

  try {
    // Najpierw zweryfikuj aktualne hasło poprzez próbę logowania
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      throw error(400, { message: 'Aktualne hasło jest nieprawidłowe' });
    }

    // Zmień hasło
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw error(500, { message: 'Błąd podczas zmiany hasła: ' + updateError.message });
    }

    return json({
      success: true,
      message: 'Hasło zostało zmienione pomyślnie'
    });
  } catch (err) {
    console.error('Error changing password:', err);
    
    if (err instanceof Error) {
      throw error(500, { message: err.message });
    }
    
    throw error(500, { message: 'Wystąpił nieznany błąd podczas zmiany hasła' });
  }
};
