import { APP_URL } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import { randomBytes } from 'crypto';
import type { RequestHandler } from './$types';

// Funkcja pomocnicza do generowania unikalnego tokenu
function generateUniqueToken(length: number = 24): string {
    return randomBytes(length).toString('hex');
}

// Endpoint POST do tworzenia nowego zaproszenia
export const POST: RequestHandler = async ({ request, locals: { supabase, user } }) => {

    if (!user) {
        throw error(401, { message: 'Unauthorized' });
    }

    try {
        // Pobranie danych z żądania
        const { project_id } = await request.json();

        if (!project_id) {
            throw error(400, { message: 'Missing required fields' });
        }

        // Sprawdzenie, czy użytkownik ma dostęp do projektu
        const { data: projectAccess, error: accessError } = await supabase
            .from('projects_users')
            .select('*')
            .eq('project_id', project_id)
            .eq('user_id', user.id)
            .single();

        if (accessError || !projectAccess) {
            throw error(403, { message: 'You do not have access to this project' });
        }

        // Generowanie unikalnego tokenu
        const token = generateUniqueToken();

        // Zapisanie tokenu w bazie danych
        const { data: invite, error: inviteError } = await supabase
            .from('project_invites')
            .insert({
                project_id,
                token,
                // Wygasa za 24 godziny
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

        if (inviteError) {
            console.error('Error creating invite:', inviteError);
            throw error(500, { message: 'Failed to create invite' });
        }

        // Usun niewazne zaproszenia
        await supabase
            .from('project_invites')
            .delete()
            .lt('expires_at', new Date().toISOString());

        // Zwrócenie informacji o utworzonym zaproszeniu
        return json({
            invite_url: `${APP_URL}/invite/${invite.token}`,
            token: invite.token,
            project_id: invite.project_id,
            expires_at: invite.expires_at
        });

    } catch (err) {
        console.error('Error in project invite creation:', err);
        throw error(500, { message: 'Internal server error' });
    }
};