import { fail, error, json } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';


import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { controllerSchema } from "$lib/server/config/zodSchemas";

import { eq, or, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargingControllerTable, chargerTable, companyTable, usersToCompaniesTable, chargingSessionTable, rfidTagTable, userTable, profileTable } from "$lib/server/db/schema";

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

    if (!controller || !chargerPermission && user.role != "ADMIN") redirect(303, "/chargers", { type: "error", message: "Nabíjecí relace nebyla nalezena" }, cookies);

    const [chargingSession] = await db
        .select()
        .from(chargingSessionTable)
        .where(eq(chargingSessionTable.id, Number(params.sessionId)));

    let employeeRfid;
    let rfidDescription;

    if (chargingSession.rfidTag) {
        [employeeRfid] = await db
            .select({
                email: userTable.email,
                firstName: profileTable.firstName,
                lastName: profileTable.lastName
            })
            .from(usersToCompaniesTable)
            .leftJoin(userTable, eq(usersToCompaniesTable.userId, userTable.id))
            .leftJoin(profileTable, eq(userTable.id, profileTable.userId))
            .where(eq(usersToCompaniesTable.rfidTag, chargingSession.rfidTag));

        [rfidDescription] = await db
            .select({
                description: rfidTagTable.description
            })
            .from(rfidTagTable)
            .where(eq(rfidTagTable.tag, chargingSession.rfidTag));
    }

    return {
        controller: controller,
        chargingSession: chargingSession,
        employeeRfid: employeeRfid,
        rfidDescription: rfidDescription?.description
    }
}
