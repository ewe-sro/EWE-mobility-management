import { fail, redirect } from "@sveltejs/kit";

import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable, profileTable } from "$lib/server/db/schema";

import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';


// Validation schema for the register form
const UserSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message: "Heslo musí alespoň 8 znaků a musí obsahovat malé písmeno, velké písmeno a číslo",
    }),
    confirmPassword: z.string()
}).refine((data) => data.password !== data.confirmPassword, {
    message: "Hesla neshodují",
    path: ["confirmPassword"],
});

export const load = (async () => {
    const form = await superValidate(zod(UserSchema));

    return { form };
});

export const actions = {
    default: async ({ request }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(UserSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // If the submitted form was valid check if the email is already registered
        const resultEmail = await db.select({
            email: userTable.email
        }).from(userTable).where(eq(userTable.email, form.data.email));

        const emailExists = resultEmail.length > 0;

        // Submitted email is already registered
        if (emailExists) {
            return setError(form, "email", "Tento email je již registrován")
        }

        // Create the new user database record
        const userId = generateId(15);
        const hashedPassword = await new Argon2id().hash(form.data.password);

        await db.insert(userTable).values({ id: userId, email: form.data.email, password: hashedPassword });

        // Create profile database record and connect it to the created user
        await db.insert(profileTable).values({ userId: userId });

        // redirect to /login
        throw redirect(303, "/login");
    },
};