// /src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ locals }) => {

  // Jeśli użytkownik jest zalogowany, przekieruj na /projects
  let { data: { session } } = await supabase.auth.getSession();
  console.log('PageServerLoad session', session != null);
  if (session) {
    throw redirect(303, '/projects');
  }

  // Jeśli użytkownik nie jest zalogowany, przekieruj na /login
  throw redirect(303, '/login');
};