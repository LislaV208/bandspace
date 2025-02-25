// /src/hooks.server.ts
import { supabase } from '$lib/supabase';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // console.log('hooks.server.ts');

  // Ustaw Supabase w locals
  // event.locals.supabase = supabase;

  // Pobierz sesję z Supabase i obsłuż błędy
  // let session = null;
  // try {
  //   const { data: { session: currentSession } } = await supabase.auth.getSession();
  //   session = currentSession;
  // } catch (error) {
  //   console.error('Error getting session:', error);
  // }


  // event.locals.session = session;
  const { data: { session } } = await supabase.auth.getSession();
  console.log('hook session', session != null);
  const { data: { user } } = await supabase.auth.getUser();
  console.log('user', user != null);

  if (!session) {
    if (!event.url.pathname.startsWith('/login')) {
      console.log('event.url.pathname', event.url.pathname);
      console.log('Redirecting to /login due to no session');
      throw redirect(303, '/login');
    }

  }
  else if (event.url.pathname.startsWith('/login')) {
    console.log('Redirecting to /');
    throw redirect(303, '/');
  }

  // Sprawdź, czy użytkownik nie jest zalogowany i próbuje wejść na /projects (ale pomiń /login i jego akcje)
  // if (!session) {
  //   // Sprawdź, czy ścieżka zaczyna się od /projects, ale pomiń /login i jego podścieżki/akcje
  //   if (event.url.pathname.startsWith('/projects') && !event.url.pathname.startsWith('/login')) {
  //     throw redirect(303, '/login');
  //   }
  // }

  // Kontynuuj przetwarzanie żądania
  return resolve(event);
};