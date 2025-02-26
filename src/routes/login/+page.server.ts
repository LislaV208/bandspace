import { authService } from '$lib/services/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';


export const actions = {
  login: async ({ request }) => {


    // TODO log the user in
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    await authService.signIn(email, password);
    redirect(303, '/');

  },
  google: async (event) => {
    // TODO log the user in
    console.log('GOOGLE');
  }
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