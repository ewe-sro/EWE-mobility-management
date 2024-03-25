import { fail, redirect } from "@sveltejs/kit";

import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas.js";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";

import { lucia } from '$lib/server/auth';
import { createAndSetSession } from "$lib/server/auth/utils";
import { Argon2id } from 'oslo/password';

const loginSchema = userSchema.pick({
    email: true,
    password: true
});

export const load = (async () => {
    const form = await superValidate(zod(loginSchema));

    return { form };
});

export const actions = {
    default: async ({ request, cookies }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(loginSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // Select user with the submitted email
        const [existingUser] = await db
            .select({
                id: userTable.id,
                password: userTable.password
            })
            .from(userTable)
            .where(eq(userTable.email, form.data.email));

        // If the submitted email wasn't found in the database
        if (existingUser === undefined) {
            return message(form, "Nesprávný e-mail nebo heslo", {
                status: 401
            });
        }

        // Check if the submitted password is correct
        const validPassword = await new Argon2id().verify(
            existingUser.password,
            form.data.password
        );

        // If the submitted password is incorrect
        if (!validPassword) {
            return message(form, "Nesprávný e-mail nebo heslo", {
                status: 401
            });
        }

        // Login the user
        await createAndSetSession(lucia, existingUser.id, cookies);

        // redirect to /
        throw redirect(303, "/dashboard");
    },
};