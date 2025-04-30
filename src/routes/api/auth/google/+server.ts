import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  try {
    const body = await request.json();
    const { redirectUrl } = body;

    // Pobierz bazowy URL z aktualnego żądania
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    // Dla Google OAuth
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl || `${baseUrl}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Google login error:", authError);
      
      // Mapowanie komunikatów błędów na przyjazne dla użytkownika komunikaty w języku polskim
      let userFriendlyError = "Wystąpił błąd podczas logowania przez Google";
      
      if (authError.message.includes("popup blocked")) {
        userFriendlyError = "Wyskakujące okienko zostało zablokowane. Zezwól na wyskakujące okienka dla tej strony.";
      } else if (authError.message.includes("popup closed")) {
        userFriendlyError = "Proces logowania został przerwany. Spróbuj ponownie.";
      } else if (authError.message.includes("Too many requests")) {
        userFriendlyError = "Zbyt wiele prób logowania. Spróbuj ponownie później.";
      }
      
      return json({ success: false, error: userFriendlyError }, { status: 400 });
    }

    return json({ 
      success: true, 
      url: data.url
    });
  } catch (err) {
    console.error('Error in Google login endpoint:', err);
    return json({ 
      success: false, 
      error: "Wystąpił nieoczekiwany błąd podczas logowania przez Google" 
    }, { status: 500 });
  }
};
