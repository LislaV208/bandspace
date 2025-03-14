import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {

  const { token } = params;

  // Sprawdzenie, czy token istnieje
  const { data: invite, error: inviteError } = await supabase
    .from('project_invites')
    .select('*, projects(name, slug)')
    .eq('token', token)
    .single();

  if (inviteError || !invite) {
    throw error(404, { message: 'Zaproszenie nie istnieje lub wygasło' });
  }

  // Sprawdzenie czy zaproszenie nie wygasło
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw error(410, { message: 'Zaproszenie wygasło' });
  }

  // Zwracamy informacje o projekcie
  return {
    invite,
    project: invite.projects
  };
};

export const actions: Actions = {
  accept: async ({ params, locals: { supabase, user } }) => {
    const { token } = params;

    if (!token) {
      throw error(400, { message: 'Brak tokenu' });
    }

    if (!user) {
      throw error(401, { message: 'Musisz być zalogowany, aby dołączyć do projektu' });
    }

    // Sprawdzenie, czy token istnieje
    const { data: invite, error: inviteError } = await supabase
      .from('project_invites')
      .select('*, projects(slug)')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      throw error(404, { message: 'Zaproszenie nie istnieje lub wygasło' });
    }

    // Sprawdzenie czy użytkownik już ma dostęp do projektu
    const { data: existingAccess } = await supabase
      .from('projects_users')
      .select('*')
      .eq('project_id', invite.project_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingAccess) {
      // Użytkownik już ma dostęp, przekieruj do projektu
      return redirect(303, `/${invite.projects.slug}`);
    }

    // Dodanie użytkownika do projektu
    const { error: addUserError } = await supabase
      .from('projects_users')
      .insert({
        project_id: invite.project_id,
        user_id: user.id
      });

    if (addUserError) {
      console.error('Error adding user to project:', addUserError);
      throw error(500, { message: 'Nie udało się dołączyć do projektu' });
    }

    // Usun niewazne zaproszenia
    await supabase
      .from('project_invites')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Przekierowanie do projektu
    return redirect(303, `/${invite.projects.slug}`);
  }
};