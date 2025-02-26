import { authService } from '$lib/services/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
    await authService.signOut();
    return json({ success: true });
};