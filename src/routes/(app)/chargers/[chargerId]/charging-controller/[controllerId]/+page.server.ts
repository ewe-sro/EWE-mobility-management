import { fail, error, json } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';

import { setFlash } from 'sveltekit-flash-message/server';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { controllerSchema } from "$lib/server/config/zodSchemas";

import { eq, or, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargingControllerTable, chargerTable, companyTable, usersToCompaniesTable, chargingSessionTable } from "$lib/server/db/schema";

export const load = async ({ locals, params, cookies }) => {
    const user = locals.user;

    if (!user) redirect(303, "/login");

    const [controller] = await db
        .select({
            controller: chargingControllerTable,
            charger: chargerTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargingControllerTable.id, params.controllerId));

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

    if (!controller || !chargerPermission && user.role != "ADMIN") redirect(303, "/chargers", { type: "error", message: "Nabíjecí bod nebyl nalezen" }, cookies);

    const chargingSessions = await db
        .select({
            chargingSession: chargingSessionTable,
            controller: chargingControllerTable,
            charger: chargerTable
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargingSessionTable.controllerId, params.controllerId))
        .orderBy(desc(chargingSessionTable.startTimestamp));

    const form = await superValidate(controller.controller, zod(controllerSchema));

    return {
        controller: controller,
        chargingSessions: chargingSessions,
        form: form
    }
}

export const actions = {
    controllerForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        if (locals.user.role !== "ADMIN") {
            error(403, { message: "Nemáte oprávnění k této akci" });
        }

        const [controller] = await db
            .select({
                controller: chargingControllerTable,
                charger: chargerTable
            })
            .from(chargingControllerTable)
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .where(eq(chargingControllerTable.id, params.controllerId));

        // get form data and validate them
        const form = await superValidate(request, zod(controllerSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // API call URL
        const apiUrl = `http://${controller.charger?.ipAddress}:${controller.charger?.restApiPort}/api/v1.0/charging-points/${controller.controller?.chargingPointId}/config`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "charging_point_name": form.data.chargingPointName }),
        });

        if (!response.ok) {
            setFlash({ type: "error", message: "Nepodařilo se upravit název nabíjecího bodu" }, cookies);
            return { form };
        }

        // Edit the charger
        await db
            .update(chargingControllerTable)
            .set({
                chargingPointName: form.data.chargingPointName
            })
            .where(eq(chargingControllerTable.id, params.controllerId));

        setFlash({ type: "success", message: "Název nabíjecího bodu byl úspěšně upraven" }, cookies);
        return { form };
    },
};