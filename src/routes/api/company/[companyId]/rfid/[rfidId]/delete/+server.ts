import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { rfidTagTable } from "$lib/server/db/schema";

export const DELETE = async ({ locals, params, cookies }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" })

    // delete the user
    await db
        .delete(rfidTagTable)
        .where(eq(rfidTagTable.id, Number(params.rfidId)));

    setFlash({ type: 'success', message: "RFID bylo úspěšně odstraněno" }, cookies);
    return json({ success: true });
}