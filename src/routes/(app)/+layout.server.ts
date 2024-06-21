import { redirect } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { profileTable } from "$lib/server/db/schema";

import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({ locals }) => {
    const user = locals.user;

    // Check user is not logged in redirect to /login
    if (!user) redirect(303, "/login");

    // Get user's profile
    const [profile] = await db
        .select({
            firstName: profileTable.firstName,
            lastName: profileTable.lastName
        })
        .from(profileTable)
        .where(eq(profileTable.userId, user.id));

    return {
        user: user,
        profile: profile,
    };
});