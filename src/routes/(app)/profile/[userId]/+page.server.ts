import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server'

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas";

import { eq, and, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable, profileTable, companyTable, usersToCompaniesTable, chargingSessionTable, chargingControllerTable, chargerTable } from "$lib/server/db/schema";

const userAccountSchema = userSchema.pick({
    firstName: true,
    lastName: true
});

export const load = (async ({ parent, locals, params }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const loggedUser = locals.user!;

    // Check if the id is of the requested user is the same
    // as logged in user, if so redirect to /profile
    if (loggedUser.id === params.userId) redirect(303, "/profile");

    const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, params.userId));

    const [profile] = await db
        .select({
            firstName: profileTable.firstName,
            lastName: profileTable.lastName
        })
        .from(profileTable)
        .where(eq(profileTable.userId, params.userId));

    // Create a form with populated data from user table
    const form = await superValidate(profile, zod(userAccountSchema));

    const companies = await db
        .select()
        .from(companyTable)
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(eq(usersToCompaniesTable.userId, params.userId));

    const chargingSessions = await db
        .select({
            chargingSession: chargingSessionTable,
            controller: chargingControllerTable,
            charger: chargerTable
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(
            and(
                eq(usersToCompaniesTable.userId, user.id),
                eq(usersToCompaniesTable.rfidTag, chargingSessionTable.rfidTag)
            )
        )
        .orderBy(desc(chargingSessionTable.startTimestamp));

    return {
        form: form,
        user: user,
        profile: profile,
        loggedUser: locals.user,
        companies: companies,
        chargingSessions: chargingSessions
    };
});


export const actions = {
    default: async ({ request, cookies, locals, params }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
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
                lastName: form.data.lastName
            })
            .where(eq(profileTable.userId, params.userId));

        return { form };
    },
};