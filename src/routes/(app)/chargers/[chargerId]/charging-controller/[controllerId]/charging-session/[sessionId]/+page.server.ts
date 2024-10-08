import { fail, error, json } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';


import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { controllerSchema } from "$lib/server/config/zodSchemas";

import { eq, or, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargingControllerTable, chargerTable, companyTable, usersToCompaniesTable, chargingSessionTable, rfidTagTable, userTable, profileTable } from "$lib/server/db/schema";

export const load = async ({ parent, locals, params, cookies }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

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

    // If the controller was not found or the user doesn't have the required permissions
    // redirect them to '/chargers'
    if (!controller || !chargerPermission && user.role != "ADMIN") redirect(303, "/chargers", { type: "error", message: "Nabíjecí relace nebyla nalezena" }, cookies);

    const [chargingSession] = await db
        .select()
        .from(chargingSessionTable)
        .where(eq(chargingSessionTable.id, Number(params.sessionId)));

    let employeeRfid;
    let rfidDescription;

    // If the charging session has an RFID
    // get the corresponding employee data or the description of the RFID tag
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
