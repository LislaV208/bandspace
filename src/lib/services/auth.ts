import { supabase } from '$lib/supabase';

export const authService = {
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        // if (error) throw error;
        return user;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async updateUser(userData: {
        email?: string;
        password?: string;
        data?: { [key: string]: any };
    }) {
        const { data, error } = await supabase.auth.updateUser(userData);
        if (error) throw error;
        return data;
    }
};