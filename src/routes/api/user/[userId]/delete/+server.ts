import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";

export const DELETE = async ({ locals, params, cookies }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user id is the same as the id of the logged in user
    if (user.id === params.userId) {
        setFlash({ type: 'error', message: "Není možné smazat svůj vlastní uživatelský účet" }, cookies);
        error(405, { message: "Unable to delete your own account" })
    }

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" })

    // delete the user
    await db
        .delete(userTable)
        .where(eq(userTable.id, params.userId));

    setFlash({ type: 'success', message: "Uživatelský účet byl smazán" }, cookies);
    return json({ success: true });
}