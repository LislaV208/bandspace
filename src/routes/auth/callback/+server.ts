import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
    console.log('auth/callback')
    const {
        url,
        locals: { supabase }
    } = event;
    const code = url.searchParams.get('code') as string;

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Tworzymy stronę pośredniczącą, która odczyta localStorage i przekieruje do właściwej strony
            return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Przekierowywanie...</title>
                </head>
                <body>
                    <script>
                        // Odczytaj zapisany URL z localStorage
                        const savedRedirect = localStorage.getItem('redirectAfterLogin');
                        console.log('Odczytano URL z localStorage:', savedRedirect);
                        
                        // Jeśli zapisano URL, przekieruj do niego, w przeciwnym razie na stronę główną
                        const redirectUrl = savedRedirect || '/';
                        
                        // Opcjonalnie usuwamy zapis z localStorage
                        localStorage.removeItem('redirectAfterLogin');
                        
                        // Przekierowanie
                        window.location.href = redirectUrl;
                    </script>
                    <noscript>
                        <meta http-equiv="refresh" content="0;url=/">
                    </noscript>
                    <p>Przekierowywanie po zalogowaniu...</p>
                </body>
                </html>`,
                {
                    headers: {
                        'Content-Type': 'text/html',
                    },
                    status: 200
                }
            );
        }
        console.error('Error exchanging code for session:', error)
    }

    // return the user to an error page with instructions
    throw redirect(303, '/');
};