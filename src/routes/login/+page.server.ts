import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request }) => {
    console.log('Login action');
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    const { error } =
      await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return fail(401, { error: error.message });
    }

    throw redirect(303, '/projects');
  },

  google: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth(
      {
        provider: 'google',
      });

    if (error) {
      return fail(400, { error: error.message });
    }

    throw redirect(303, data.url ?? '/login');


  }
};