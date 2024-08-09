import { redirect } from 'sveltekit-flash-message/server';

import { eq, and, or, desc, isNotNull } from 'drizzle-orm';
import { db } from "$lib/server/db";
import {
    chargingControllerTable,
    chargerTable,
    controllerDataTable,
    companyTable,
    usersToCompaniesTable,
    chargingSessionTable,
    userTable,
    profileTable,
    rfidTagTable
} from "$lib/server/db/schema";

export const load = async ({ locals, params, cookies }) => {
    const user = locals.user;

    if (!user) redirect(303, "/login");

    const [controller] = await db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable,
            controllerData: controllerDataTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
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

    // Subquery for getting the employee with the RFID of the charging session
    const sqRfidEmployee = db
        .select({
            chargingSessionId: chargingSessionTable.id,
            employee: {
                email: userTable.email,
                firstName: profileTable.firstName,
                lastName: profileTable.lastName
            }
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(usersToCompaniesTable, eq(chargerTable.companyId, usersToCompaniesTable.companyId))
        .leftJoin(userTable, eq(usersToCompaniesTable.userId, userTable.id))
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId))
        .where(eq(chargingSessionTable.rfidTag, usersToCompaniesTable.rfidTag))
        .as("sqRfidEmployee");

    // Subquery for getting the employee with the RFID of the charging session
    const sqRfid = db
        .select({
            chargingSessionId: chargingSessionTable.id,
            description: rfidTagTable.description
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(rfidTagTable, eq(chargerTable.companyId, rfidTagTable.companyId))
        .where(eq(chargingSessionTable.rfidTag, rfidTagTable.tag))
        .as("sqRfid");


    const [userInCompany] = await db
        .select()
        .from(usersToCompaniesTable)
        .where(
            and(
                eq(usersToCompaniesTable.companyId, controller.charger?.companyId),
                eq(usersToCompaniesTable.userId, user.id)
            )
        );


    let chargingSessions;

    if (userInCompany.role !== "Host") {
        chargingSessions = await db
            .select({
                chargingSession: chargingSessionTable,
                controller: chargingControllerTable,
                charger: chargerTable,
                employee: sqRfidEmployee.employee,
                rfidDescription: sqRfid.description
            })
            .from(chargingSessionTable)
            .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .leftJoin(sqRfidEmployee, eq(chargingSessionTable.id, sqRfidEmployee.chargingSessionId))
            .leftJoin(sqRfid, eq(chargingSessionTable.id, sqRfid.chargingSessionId))
            .where(eq(chargingSessionTable.controllerId, params.controllerId))
            .orderBy(desc(chargingSessionTable.startTimestamp));
    } else {
        chargingSessions = await db
            .select({
                chargingSession: chargingSessionTable,
                controller: chargingControllerTable,
                charger: chargerTable,
                employee: sqRfidEmployee.employee,
                rfidDescription: sqRfid.description
            })
            .from(chargingSessionTable)
            .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .leftJoin(sqRfidEmployee, eq(chargingSessionTable.id, sqRfidEmployee.chargingSessionId))
            .leftJoin(sqRfid, eq(chargingSessionTable.id, sqRfid.chargingSessionId))
            .where(
                and(
                    eq(chargingSessionTable.controllerId, params.controllerId),
                    eq(chargingSessionTable.rfidTag, userInCompany.rfidTag)
                )
            )
            .orderBy(desc(chargingSessionTable.startTimestamp));
    }


    return {
        controller: controller,
        chargingSessions: chargingSessions
    }
}