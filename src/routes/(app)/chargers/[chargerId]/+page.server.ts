import { fail, error } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';

import { setFlash } from 'sveltekit-flash-message/server';

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { chargerSchema } from "$lib/server/config/zodSchemas";

import { eq, or, and, ne } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, companyTable, usersToCompaniesTable, chargingControllerTable, lastKnownStateTable, connectionStatusTable } from "$lib/server/db/schema";

export const load = async ({ locals, params, cookies }) => {
    const user = locals.user;

    if (!user) redirect(303, "/login");

    // Get the company record from database
    const [charger] = await db
        .select({
            charger: chargerTable,
            company: companyTable,
            status: connectionStatusTable
        })
        .from(chargerTable)
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .leftJoin(connectionStatusTable, eq(chargerTable.id, connectionStatusTable.chargerId))
        .where(eq(chargerTable.id, Number(params.chargerId)));

    const [chargerPermission] = await db
        .select()
        .from(chargerTable)
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
        .where(
            or(
                eq(usersToCompaniesTable.userId, user.id),
                eq(chargerTable.userId, user.id)
            )
        );

    if (!charger || !chargerPermission && user.role != "ADMIN") redirect(303, "/chargers", { type: "error", message: "Nabíjecí stanice nebyla nalezena" }, cookies);

    const form = await superValidate(charger.charger, zod(chargerSchema));

    const companies = await db
        .select({
            company: companyTable
        })
        .from(companyTable);

    const chargingControllers = await db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable,
            state: lastKnownStateTable.state
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(lastKnownStateTable, eq(chargingControllerTable.id, lastKnownStateTable.controllerId))
        .where(eq(chargingControllerTable.chargerId, charger.charger.id));

    return {
        charger: charger,
        chargingControllers: chargingControllers,
        companies: companies,
        form: form
    }
}

export const actions = {
    chargerForm: async ({ request, locals, params, cookies }) => {
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
                    eq(chargerTable.restApiPort, form.data.restApiPort),
                    ne(chargerTable.id, Number(params.chargerId))
                )
            );

        if (chargerExists.length > 0) {
            return message(form, "Nabíjecí stanice s těmito síťovými údaji již existuje");
        }

        // Edit the charger
        await db
            .update(chargerTable)
            .set({
                name: form.data.name,
                description: form.data.description,
                ipAddress: form.data.ipAddress,
                mqttPort: form.data.mqttPort,
                mqttUser: form.data.mqttUser,
                mqttPassword: form.data.mqttPassword,
                restApiPort: form.data.restApiPort
            })
            .where(eq(chargerTable.id, Number(params.chargerId)));

        setFlash({ type: "success", message: "Nabíjecí stanice byla úspěšně upravena" }, cookies);
        return { form };
    },
};