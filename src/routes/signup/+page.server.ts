// import { authService } from '$lib/services/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';


export const actions = {
    default: async ({ request, locals: { supabase } }) => {

        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const confirmPassword = formData.get('confirm-password')?.toString();

        if (!email || !password) {
            return fail(400, { error: 'Email i hasło są wymagane' });
        }

        if (password !== confirmPassword) {
            return fail(400, { error: 'Podane hasła różnią się od siebie' });
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });


        if (error) {
            return fail(401, { error: error.message });
        }

        redirect(303, '/');
    }
} satisfies Actions;