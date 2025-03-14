import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
    const { session, user } = await safeGetSession()

    // if (!authUser) {
    //     return {
    //         session,
    //         cookies: cookies.getAll(),
    //         user: null
    //     }
    // }
    // // zwróć usera z public.users a nie z auth.users
    // const { data: user } = await supabase.from('users').select().eq('id', authUser.id).single();

    return {
        session,
        cookies: cookies.getAll(),
        user
    }
}