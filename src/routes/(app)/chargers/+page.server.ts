import { error, fail } from "@sveltejs/kit";

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { chargerSchema } from "$lib/server/config/zodSchemas";

import { eq, and, or, count, sum } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable, companyTable, usersToCompaniesTable, connectionStatusTable, lastKnownStateTable, userTable, profileTable } from "$lib/server/db/schema";

export const load = async ({ locals, cookies }) => {
    if (!locals.user) {
        redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

    // Subquery for getting number of charging controllers
    const sqController = await db
        .select({
            chargerId: chargerTable.id,
            controllerCount: count(chargingControllerTable.id).as("controllerCount")
        })
        .from(chargerTable)
        .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .groupBy(chargerTable.id)
        .as("sqController");

    // Subquery for getting number of disconnected charging controllers
    const sqAvailable = await db
        .select({
            chargerId: chargerTable.id,
            onlineCount: count(lastKnownStateTable.id).as("onlineCount")
        })
        .from(lastKnownStateTable)
        .leftJoin(chargingControllerTable, eq(chargingControllerTable.id, lastKnownStateTable.controllerId))
        .leftJoin(chargerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .where(eq(lastKnownStateTable.state, "disconnected"))
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
            .groupBy(companyTable.id);


        chargers = await db
            .select({
                charger: chargerTable,
                status: connectionStatusTable,
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.onlineCount)
            })
            .from(chargerTable)
            .leftJoin(companyTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(connectionStatusTable, eq(chargerTable.id, connectionStatusTable.chargerId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .groupBy(chargerTable.id, connectionStatusTable.id);

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
            .groupBy(companyTable.id);

        chargers = await db
            .select({
                charger: chargerTable,
                status: connectionStatusTable,
                controllerCount: count(chargingControllerTable.id)
            })
            .from(chargerTable)
            .leftJoin(companyTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, chargerTable.companyId))
            .leftJoin(connectionStatusTable, eq(chargerTable.id, connectionStatusTable.chargerId))
            .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
            .where(
                or(
                    eq(usersToCompaniesTable.userId, locals.user.id),
                    eq(chargerTable.userId, locals.user.id)
                )
            )
            .groupBy(chargerTable.id, connectionStatusTable.id);
        ;
    }

    const users = await db
        .select({
            user: userTable,
            profile: profileTable
        })
        .from(userTable)
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId));

    const form = await superValidate(zod(chargerSchema));

    return {
        companies: companies,
        users: users,
        chargers: chargers,
        user: locals.user,
        form: form
    };
}

export const actions = {
    default: async ({ request, locals, cookies }) => {
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

        // Check if charger with submitted network settings is already in database
        const chargerExists = await db
            .select()
            .from(chargerTable)
            .where(
                and(
                    eq(chargerTable.ipAddress, form.data.ipAddress),
                    eq(chargerTable.mqttPort, form.data.mqttPort),
                    eq(chargerTable.restApiPort, form.data.restApiPort)
                )
            );

        if (chargerExists.length > 0) {
            return message(form, "Nabíjecí stanice s těmito síťovými údaji již existuje")
        }

        // Add the charger to the database
        const [newCharger] = await db
            .insert(chargerTable)
            .values({
                name: form.data.name,
                description: form.data.description,
                ipAddress: form.data.ipAddress,
                mqttPort: form.data.mqttPort,
                mqttUser: form.data.mqttUser,
                mqttPassword: form.data.mqttPassword,
                restApiPort: form.data.restApiPort
            })
            .returning()

        // Create a connectionStatus database record for the new charger
        await db
            .insert(connectionStatusTable)
            .values({
                mqttStatus: false,
                restApiStatus: false,
                chargerId: newCharger.id
            });

        return { form };
    },
};