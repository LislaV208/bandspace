import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Endpoint do aktualizacji profilu użytkownika.
 * Obsługuje żądanie PATCH z nową nazwą użytkownika.
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
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
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw error(400, { message: 'Nazwa nie może być pusta' });
  }


  // 1. Aktualizacja metadanych użytkownika w auth.users
  const { data, error: updateError } = await supabase.auth.updateUser({
    data: { name: name.trim(), full_name: name.trim() }
  });

  if (updateError) {
    throw error(500, { message: 'Błąd podczas aktualizacji profilu' });
  }

  // 2. Ręczna aktualizacja tabeli users dla zachowania spójności
  const { error: updateProfileError } = await supabase
    .from('users')
    .update({ name: name.trim() })
    .eq('id', user.id);

  if (updateProfileError) {
    throw error(500, { message: 'Błąd podczas aktualizacji tabeli users' });
  }

  // Zwróć zaktualizowane dane
  return json({
    success: true,
    user: data.user
  });

};
