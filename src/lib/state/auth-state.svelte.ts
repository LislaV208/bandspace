import type { Database } from "$lib/database.types";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getContext, setContext } from "svelte";

interface AuthStateProps {
    supabase: SupabaseClient<Database>;
    session: Session | null;
    user: User | null;
}

export class AuthState {
    session = $state<Session | null>(null);
    supabase = $state<SupabaseClient<Database> | null>(null);
    user = $state<User | null>(null);

    constructor(props: AuthStateProps) {
        this.updateState(props);
    }

    updateState(props: AuthStateProps) {
        this.session = props.session;
        this.supabase = props.supabase;
        this.user = props.user;
    }

    async signOut() {
        await this.supabase?.auth.signOut();
    }
}

const AUTH_STATE_KEY = Symbol('AUTH_STATE');

export function setAuthState(props: AuthStateProps) {
    return setContext(AUTH_STATE_KEY, new AuthState(props));
}

export function getAuthState() {
    return getContext<ReturnType<typeof setAuthState>>(AUTH_STATE_KEY);
}