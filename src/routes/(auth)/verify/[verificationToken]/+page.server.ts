import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server'

import { generateId } from "lucia";
import { isWithinExpirationDate } from "oslo";
import { Argon2id } from "oslo/password";

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from "$lib/server/config/zodSchemas.js";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { registerInvitationTable, companyTable, userTable, profileTable, usersToCompaniesTable } from "$lib/server/db/schema";


const registerFormSchema = registerSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
});


export const load = async ({ params, cookies }) => {
    const [invitedUser] = await db
        .select({
            invitation: registerInvitationTable,
            company: companyTable
        })
        .from(registerInvitationTable)
        .leftJoin(companyTable, eq(registerInvitationTable.companyId, companyTable.id))
        .where(eq(registerInvitationTable.id, params.verificationToken));

    if (!invitedUser) {
        redirect(302, "/login", { type: "error", message: "Zadaný registrační odkaz je neplatný" }, cookies);
    }

    const invitationValid = isWithinExpirationDate(invitedUser.invitation.expiresAt);

    if (!invitationValid) {
        redirect(302, "/login", { type: "error", message: "Zadaný registrační odkaz je neplatný" }, cookies);
    }

    const form = await superValidate(zod(registerFormSchema));

    return {
        form: form,
        invitedUser: invitedUser
    };
};


export const actions = {
    default: async ({ request, params, cookies }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(registerFormSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        const [invitedUser] = await db
            .select()
            .from(registerInvitationTable)
            .where(eq(registerInvitationTable.id, params.verificationToken));


        // If the submitted email wasn't found in the database
        if (!invitedUser) {
            redirect(302, "/login", { type: "error", message: "Zadaný registrační odkaz je neplatný" }, cookies);
        }

        // Check if user didn't change the disabled inputs
        if (invitedUser.email !== form.data.email) {
            return message(form, "Zadaný e-mail je neplatný", {
                status: 401
            });
        }

        if (invitedUser.companyId !== form.data.companyId) {
            return message(form, "Zadaná společnost je neplatná", {
                status: 401
            });
        }

        // Check if user email is already registered
        const registeredUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, invitedUser.email));

        const userExists = registeredUser.length > 0;

        if (userExists) {
            return message(form, "Uživatel s tímto e-mailem je již registrován", {
                status: 401
            });
        }

        // Generate userId and hash the password
        const userId = generateId(15);
        const hashedPassword = await new Argon2id().hash(form.data.password);

        // Create new user record in the database
        await db
            .insert(userTable)
            .values({
                id: userId,
                email: invitedUser.email,
                password: hashedPassword
            });

        // Create a profile record for the new user
        await db
            .insert(profileTable)
            .values({
                firstName: form.data.firstName,
                lastName: form.data.lastName,
                userId: userId
            });

        // Delete the register invitation record
        await db
            .delete(registerInvitationTable)
            .where(eq(registerInvitationTable.id, params.verificationToken));

        // Add the created user to company
        if (form.data.companyId) {
            await db
                .insert(usersToCompaniesTable)
                .values({
                    userId: userId,
                    companyId: form.data.companyId,
                    role: invitedUser.companyRole
                });
        }

        redirect(302, "/login", { type: "success", message: "Registrace byla úspěšná, můžete se přihlásit" }, cookies);
    },
};