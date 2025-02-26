// /src/hooks.server.ts
import { authService } from '$lib/services/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {

  const user = await authService.getUser();
  console.log('user', user != null);
  event.locals.user = user;

  if (!user) {
    if (!event.url.pathname.startsWith('/login')) {
      console.log('event.url.pathname', event.url.pathname);
      console.log('Redirecting to /login due to no session');
      throw redirect(303, '/login');
    }
  }
  else {
    if (event.url.pathname.startsWith('/login')) {
      console.log('event.url.pathname', event.url.pathname);
      console.log('Redirecting to / due to no session');
      throw redirect(303, '/');
    }
  }

  // Kontynuuj przetwarzanie żądania
  return resolve(event);
};