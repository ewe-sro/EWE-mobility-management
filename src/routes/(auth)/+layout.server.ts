import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    const user = locals.user;

    // If user is already logged in redirect to /dashboard
    if (user) throw redirect(303, "/dashboard");
};