import { error, fail } from "@sveltejs/kit";

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { generateId } from "lucia";

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { chargerSchema } from "$lib/server/config/zodSchemas";

import { eq, and, or, count, sum, isNotNull, gte, asc, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, controllerDataTable, chargingControllerTable, companyTable, usersToCompaniesTable, userTable, profileTable } from "$lib/server/db/schema";

export const load = async ({ parent, locals }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

    // Subquery for getting number of charging controllers
    const sqController = db
        .select({
            chargerId: chargerTable.id,
            controllerCount: count(chargingControllerTable.id).as("controllerCount")
        })
        .from(chargerTable)
        .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .groupBy(chargerTable.id)
        .as("sqController");

    // Subquery for getting number of disconnected charging controllers
    const sqAvailable = db
        .select({
            chargerId: chargerTable.id,
            availableCount: count(controllerDataTable.id).as("availableCount")
        })
        .from(controllerDataTable)
        .leftJoin(chargingControllerTable, eq(controllerDataTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(
            and(
                eq(controllerDataTable.connectedState, "disconnected"),
                gte(chargerTable.lastConnected, sql`timezone('utc', now()) - INTERVAL '3 minutes'`)
            )
        )
        .groupBy(chargerTable.id)
        .as("sqAvailable");

    let companies;
    let chargers;

    // Dynamic query for getting companies
    const companyQuery = db
        .select({
            company: companyTable,
            chargerCount: count(chargerTable.id)
        })
        .from(companyTable)
        .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
        .groupBy(companyTable.id)
        .orderBy(asc(companyTable.name))
        .$dynamic();

    // Dynamic query for getting chargers
    const chargerQuery = db
        .select({
            charger: chargerTable,
            controllerCount: sum(sqController.controllerCount),
            availableCount: sum(sqAvailable.availableCount)
        })
        .from(chargerTable)
        .leftJoin(companyTable, eq(companyTable.id, chargerTable.companyId))
        .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
        .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
        .groupBy(chargerTable.id)
        .orderBy(
            asc(chargerTable.name),
            asc(chargerTable.description)
        )
        .$dynamic();

    if (user.role === "ADMIN") {
        // Get all companies and chargers if the logged in user as ADMIN
        companies = await companyQuery;
        chargers = await chargerQuery;

    } else {
        // Get companies and chargers that the logged in user is associated with
        companies = await companyQuery
            .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
            .where(
                eq(usersToCompaniesTable.userId, user.id),
            );

        chargers = await chargerQuery
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, chargerTable.companyId))
            .where(
                or(
                    eq(usersToCompaniesTable.userId, user.id),
                    eq(chargerTable.userId, user.id)
                )
            );
    }

    const users = await db
        .select({
            user: userTable,
            profile: profileTable
        })
        .from(userTable)
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId));

    const usersWithCharger = await db
        .select({
            user: userTable
        })
        .from(userTable)
        .leftJoin(chargerTable, eq(userTable.id, chargerTable.userId))
        .where(isNotNull(chargerTable.userId));

    // Form for adding a charger
    const form = await superValidate(zod(chargerSchema));

    return {
        companies,
        users,
        chargers,
        user,
        usersWithCharger,
        form
    };
}

export const actions = {
    chargerForm: async ({ request, locals, cookies }) => {
        const user = locals.user!;

        if (user.role !== "ADMIN") {
            error(403, { message: "Nemáte oprávnění k této akci" });
        }

        // get form data and validate them
        const form = await superValidate(request, zod(chargerSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // generate API key
        const apiKey = generateId(20);

        // Add the charger to the database
        await db
            .insert(chargerTable)
            .values({
                name: form.data.name,
                description: form.data.description,
                companyId: form.data.companyId,
                apiKey: apiKey
            });

        setFlash({ type: "success", message: "Nabíjecí stanice byla úspěšně přidána" }, cookies);
        return message(form, apiKey);
    },
};