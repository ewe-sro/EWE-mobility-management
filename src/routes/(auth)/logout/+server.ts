import { redirect } from '@sveltejs/kit';

import { lucia } from '$lib/server/auth';

export const GET = async ({ locals }) => {
    // get the current login session
    const session = locals.session;

    // if user session is empty redirect to /login
    if (!session) throw redirect(302, "/login");

    // if user session exists invalidate all user sessions and redirect to /login
    await lucia.invalidateSession(session.id);
    redirect(302, "/login");
}