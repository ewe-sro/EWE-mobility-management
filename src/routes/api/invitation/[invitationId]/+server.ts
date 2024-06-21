import { error, json } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { registerInvitationTable } from "$lib/server/db/schema";

export const GET = async ({ locals, params }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" })

    // delete the register invitation
    const [invitation] = await db
        .select()
        .from(registerInvitationTable)
        .where(eq(registerInvitationTable.id, params.invitationId));

    return json(invitation);
}