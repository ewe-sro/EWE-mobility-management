import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server'

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { profileTable, companyTable, usersToCompaniesTable } from "$lib/server/db/schema";

const userAccountSchema = userSchema.pick({
    firstName: true,
    lastName: true
});

export const load = (async ({ locals, cookies }) => {
    if (!locals.user) {
        redirect(301, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

    const [userAccountData] = await db
        .select({
            firstName: profileTable.firstName,
            lastName: profileTable.lastName
        })
        .from(profileTable)
        .where(eq(profileTable.userId, locals.user.id))

    // Create a form with populated data from user table
    const form = await superValidate(userAccountData, zod(userAccountSchema));

    const companies = await db
        .select()
        .from(companyTable)
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(eq(usersToCompaniesTable.userId, locals.user.id));

    return {
        form: form,
        user: locals.user,
        companies: companies
    };
});

export const actions = {
    default: async ({ request, cookies, locals }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(userAccountSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        await db
            .update(profileTable)
            .set({
                firstName: form.data.firstName,
                lastName: form.data.lastName,
                userId: locals.user.id
            })
            .where(eq(profileTable.userId, locals.user.id));

        return { form };
    },
};