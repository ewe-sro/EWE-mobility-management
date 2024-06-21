import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server'

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable, profileTable, companyTable, usersToCompaniesTable } from "$lib/server/db/schema";

const userAccountSchema = userSchema.pick({
    firstName: true,
    lastName: true
});

export const load = (async ({ locals, params, cookies }) => {
    if (!locals.user) {
        redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

    if (locals.user.id === params.userId) redirect(301, "/profile");

    const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, params.userId));

    const [userAccountData] = await db
        .select({
            firstName: profileTable.firstName,
            lastName: profileTable.lastName
        })
        .from(profileTable)
        .where(eq(profileTable.userId, params.userId))

    // Create a form with populated data from user table
    const form = await superValidate(userAccountData, zod(userAccountSchema));

    const companies = await db
        .select()
        .from(companyTable)
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(eq(usersToCompaniesTable.userId, params.userId));

    return {
        form: form,
        user: user,
        loggedUser: locals.user,
        companies: companies
    };
});