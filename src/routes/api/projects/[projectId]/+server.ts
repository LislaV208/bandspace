import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

/**
 * Endpoint do aktualizacji projektu.
 * Obsługuje żądanie PATCH z nową nazwą projektu.
 */
export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  // Sprawdź czy użytkownik jest zalogowany
  const { user, supabase } = locals;

  if (!user || !supabase) {
    throw error(401, { message: 'Nie jesteś zalogowany' });
  }

  const projectId = params.projectId;
  if (!projectId || isNaN(parseInt(projectId))) {
    throw error(400, { message: 'Nieprawidłowe ID projektu' });
  }

  // Pobierz dane z żądania
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw error(400, { message: 'Nieprawidłowy format danych' });
  }

  // Walidacja danych
  const { name, oldSlug } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw error(400, { message: 'Nazwa projektu nie może być pusta' });
  }

  // Sprawdź, czy użytkownik ma dostęp do projektu
  const { data: projectAccess, error: accessError } = await supabase
    .from('projects_users')
    .select('*')
    .eq('project_id', parseInt(projectId))
    .eq('user_id', user.id)
    .single();

  if (accessError || !projectAccess) {
    throw error(403, { message: 'Nie masz dostępu do tego projektu' });
  }

  // Aktualizacja nazwy projektu w bazie danych
  // Slug zostanie automatycznie zaktualizowany przez trigger w bazie danych
  const { data, error: updateError } = await supabase
    .from('projects')
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', parseInt(projectId))
    .select()
    .single();

  if (updateError) {
    console.error('Błąd podczas aktualizacji projektu:', updateError);
    throw error(500, { message: updateError.message });
  }

  // Zwróć zaktualizowane dane
  return json({
    success: true,
    project: data,
    redirect: oldSlug && oldSlug !== data.slug ? `/${data.slug}` : null
  });
};
