import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      throw redirect(303, "/dashboard");
    }

    // Jeśli nie ma błędu, pozwól na renderowanie strony +page.svelte,
    // która obsłuży przekierowanie po stronie klienta
    return {};
  }

  // Jeśli nie ma kodu, przekieruj na dashboard
  throw redirect(303, "/dashboard");
};
