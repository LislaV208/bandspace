import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';


export const actions = {
  login: async ({ request, locals: { supabase } }) => {

    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email i hasło są wymagane' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('LOGIN', data, error);



    if (error) {
      return fail(401, { error: error.message });
    }

    redirect(303, '/');

  },
  googleLogin: async ({ locals: { supabase } }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // redirectTo: `http://localhost:5173/auth/callback`,
        redirectTo: `https://bandspace.vercel.app/auth/callback`,
      },
    });

    if (error) {
      return fail(400, {
        message: "Wystąpił błąd podczas logowania Google",
      });
    }

    redirect(303, data.url);
  },
} satisfies Actions;

// export const actions: Actions = {
//   login: async ({ request }) => {
//     console.log('Zwracamy sukces');
//     return { success: true };
//     // console.log('Login action');
//     // const formData = await request.formData();
//     // const email = formData.get('email')?.toString();
//     // const password = formData.get('password')?.toString();

//     // if (!email || !password) {
//     //   return fail(400, { error: 'Email and password are required' });
//     // }

//     // try {
//     //   const user = await authService.signIn(email, password);
//     //   return { success: true, user };
//     // } catch (error) {
//     //   return fail(401, { error: error instanceof Error ? error.message : 'Authentication failed' });
//     // }
//   },

//   google: async () => {
//     const { data, error } = await supabase.auth.signInWithOAuth(
//       {
//         provider: 'google',
//       });

//     if (error) {
//       return fail(400, { error: error.message });
//     }

//     throw redirect(303, data.url ?? '/login');
//   }
// };