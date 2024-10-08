import { fail } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server'

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas";

import { eq, and, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { profileTable, companyTable, usersToCompaniesTable, chargingSessionTable, chargingControllerTable, chargerTable } from "$lib/server/db/schema";

const userAccountSchema = userSchema.pick({
    firstName: true,
    lastName: true
});

export const load = (async ({ parent, locals }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

    const [userAccountData] = await db
        .select({
            firstName: profileTable.firstName,
            lastName: profileTable.lastName
        })
        .from(profileTable)
        .where(eq(profileTable.userId, user.id))

    // Create a form with populated data from user table
    const form = await superValidate(userAccountData, zod(userAccountSchema));

    const companies = await db
        .select()
        .from(companyTable)
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(eq(usersToCompaniesTable.userId, user.id));

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
        form,
        user,
        companies,
        chargingSessions
    };
});

export const actions = {
    default: async ({ request, cookies, locals }) => {
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
                lastName: form.data.lastName,
                userId: locals.user.id
            })
            .where(eq(profileTable.userId, locals.user.id));

        return { form };
    },
};