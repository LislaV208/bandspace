import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  try {
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    if (!email || !password) {
      return json({ success: false, error: "Email i hasło są wymagane" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return json({ success: false, error: "Podane hasła różnią się od siebie" }, { status: 400 });
    }

    // Używamy adresu email jako tymczasowej nazwy użytkownika
    // Użytkownik będzie mógł zaktualizować swoją nazwę później
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: email.split("@")[0], // Używamy części adresu email przed @ jako tymczasowej nazwy
        },
      },
    });

    if (authError) {
      console.error("Registration error:", authError);
      
      // Mapowanie komunikatów błędów na przyjazne dla użytkownika komunikaty w języku polskim
      let userFriendlyError = "Wystąpił błąd podczas rejestracji";
      
      if (authError.message.includes("already registered")) {
        userFriendlyError = "Ten adres email jest już zarejestrowany";
      } else if (authError.message.includes("weak password")) {
        userFriendlyError = "Hasło jest zbyt słabe. Użyj silniejszego hasła.";
      } else if (authError.message.includes("Invalid email")) {
        userFriendlyError = "Nieprawidłowy format adresu email";
      } else if (authError.message.includes("Too many requests")) {
        userFriendlyError = "Zbyt wiele prób rejestracji. Spróbuj ponownie później.";
      }
      
      return json({ success: false, error: userFriendlyError }, { status: 401 });
    }

    return json({ 
      success: true, 
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Error in register endpoint:', err);
    return json({ 
      success: false, 
      error: "Wystąpił nieoczekiwany błąd podczas rejestracji" 
    }, { status: 500 });
  }
};
