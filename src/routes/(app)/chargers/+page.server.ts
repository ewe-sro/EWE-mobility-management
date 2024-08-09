import { error, fail } from "@sveltejs/kit";

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { generateId } from "lucia";

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { chargerSchema } from "$lib/server/config/zodSchemas";

import { eq, and, or, count, sum, isNotNull } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, controllerDataTable, chargingControllerTable, companyTable, usersToCompaniesTable, userTable, profileTable } from "$lib/server/db/schema";

export const load = async ({ locals, cookies }) => {
    if (!locals.user) {
        redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

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
            onlineCount: count(controllerDataTable.id).as("onlineCount")
        })
        .from(controllerDataTable)
        .leftJoin(chargingControllerTable, eq(controllerDataTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(controllerDataTable.connectedState, "disconnected"))
        .groupBy(chargerTable.id)
        .as("sqAvailable");

    let companies;
    let chargers;

    if (locals.user?.role === "ADMIN") {
        companies = await db
            .select({
                company: companyTable,
                chargerCount: count(chargerTable.id)
            })
            .from(companyTable)
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);

        chargers = await db
            .select({
                charger: chargerTable,
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.onlineCount)
            })
            .from(chargerTable)
            .leftJoin(companyTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .groupBy(chargerTable.id);

    } else {
        companies = await db
            .select({
                company: companyTable,
                chargerCount: count(chargerTable.id)
            })
            .from(companyTable)
            .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .where(
                eq(usersToCompaniesTable.userId, locals.user.id),
            )
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);


        chargers = await db
            .select({
                charger: chargerTable,
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.onlineCount)
            })
            .from(chargerTable)
            .leftJoin(companyTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, chargerTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .where(
                or(
                    eq(usersToCompaniesTable.userId, locals.user.id),
                    eq(chargerTable.userId, locals.user.id)
                )
            )
            .groupBy(chargerTable.id);
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

    const form = await superValidate(zod(chargerSchema));

    return {
        companies: companies,
        users: users,
        chargers: chargers,
        user: locals.user,
        usersWithCharger: usersWithCharger,
        form: form
    };
}

export const actions = {
    chargerForm: async ({ request, locals, cookies }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        if (locals.user.role !== "ADMIN") {
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