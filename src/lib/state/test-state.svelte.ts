import type { User } from "@supabase/supabase-js";
import { getContext, setContext } from "svelte";

export class TestState {
    name = $state<string | null>(null);
    user = $state<User | null>(null);

    constructor(name: string | null, user: User | null) {
        this.name = name;
        this.user = user;
    }

    update(name: string | null, user: User | null) {
        this.name = name;
        this.user = user;
    }
}

const KEY = Symbol('test_state');

export function setTestState(name: string | null, user: User | null) {
    return setContext(KEY, new TestState(name, user));
}

export function getTestState() {
    return getContext<ReturnType<typeof setTestState>>(KEY);
}