import { fail, redirect } from "@sveltejs/kit";

import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas.js";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";

import { lucia } from '$lib/server/auth';
import { createAndSetSession } from "$lib/server/auth/utils";
import { createPasswordResetToken } from "$lib/server/auth/utils";

const resetSchema = userSchema.pick({
    email: true
});

export const load = (async () => {
    const form = await superValidate(zod(resetSchema));

    return { form };
});

export const actions = {
    default: async ({ request, cookies }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(resetSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // If the submitted form was valid check if user with the submitted email exists
        const resultEmail = await db.select({
            email: userTable.email
        }).from(userTable).where(eq(userTable.email, form.data.email));

        const emailExists = resultEmail.length > 0;

        if (!emailExists) {
            return message(form, "Nesprávný e-mail nebo heslo", {
                status: 401
            });
        }

        // Login the user
        await createAndSetSession(lucia, existingUser.id, cookies);

        // redirect to /
        throw redirect(303, "/");
    },
};