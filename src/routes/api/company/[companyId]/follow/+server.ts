import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { and, eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { companyFollowTable } from "$lib/server/db/schema";

export const POST = async ({ locals, params }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "You need to be authenticated." });

    // Check if the user is already following the company
    const [isFollowing] = await db
        .select()
        .from(companyFollowTable)
        .where(
            and(
                eq(companyFollowTable.companyId, Number(params.companyId)),
                eq(companyFollowTable.userId, user.id)
            )
        );

    if (isFollowing) {
        // If the user is already following the company => unfollow
        await db
            .delete(companyFollowTable)
            .where(
                and(
                    eq(companyFollowTable.companyId, Number(params.companyId)),
                    eq(companyFollowTable.userId, user.id)
                )
            );

    } else {
        // If the user is not following the company => follow
        await db
            .insert(companyFollowTable)
            .values({
                companyId: Number(params.companyId),
                userId: user.id
            });
    }

    return json({ success: true });
}