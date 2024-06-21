import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';

import { superValidate, setError, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from "$lib/server/config/zodSchemas.js";

import { lucia } from '$lib/server/auth';
import { isWithinExpirationDate } from "oslo";
import { Argon2id } from "oslo/password";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable, passwordResetTable } from "$lib/server/db/schema";

const resetSchema = registerSchema.pick({
    password: true,
    confirmPassword: true
}).refine((data) => data.password !== data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
});

export const load = (async ({ params }) => {
    // Get verification token from URL parameter
    const verificationToken = params.verificationToken;

    // Encode the verification token
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));

    // Get the corresponding token
    const [token] = await db
        .select()
        .from(passwordResetTable)
        .where(eq(passwordResetTable.tokenHash, tokenHash));

    const tokenExists = ((token === undefined) ? false : true);

    // Check if token is not expired
    const tokenValid = ((isWithinExpirationDate(token.expiresAt)) ? true : false)

    const form = await superValidate(zod(resetSchema));

    return {
        form: form,
        tokenExists: tokenExists,
        tokenValid: tokenValid
    };
});

export const actions = {
    default: async ({ request, params, cookies }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(resetSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // Get verification token from URL parameter
        const verificationToken = params.verificationToken;

        // Encode the verification token
        const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));

        // Get the corresponding token
        const [token] = await db
            .select()
            .from(passwordResetTable)
            .where(eq(passwordResetTable.tokenHash, tokenHash));

        await lucia.invalidateUserSessions(token.userId);

        // Hash the entered password
        const hashedPassword = await new Argon2id().hash(form.data.password);

        // Write the changed password to database
        await db.update(userTable)
            .set({ password: hashedPassword })
            .where(eq(userTable.id, token.userId));

        redirect(303, "/login", { type: "success", message: "Vaše heslo bylo úspěšně změněno" }, cookies);
    },
};