import type { SupabaseClient } from "@supabase/supabase-js";
import { getContext, setContext } from "svelte";
import type { Database } from "./database.types";

const KEY = Symbol("supabase-context");

export function setSupabaseContext(supabase: SupabaseClient<Database>) {
  return setContext(KEY, supabase);
}

export function getSupabaseContext() {
  return getContext<ReturnType<typeof setSupabaseContext>>(KEY);
}
