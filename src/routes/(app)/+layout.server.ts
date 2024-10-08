import { redirect } from 'sveltekit-flash-message/server';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { profileTable } from "$lib/server/db/schema";

export const load = async ({ locals, url, cookies }) => {
    const user = locals.user;

    // Check user is not logged in redirect to /login
    if (!user) {
        const fromUrl = encodeURIComponent(url.pathname + url.search);
        redirect(302, `/login?redirectTo=${fromUrl}`, { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

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
};