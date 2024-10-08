import { fail, error } from "@sveltejs/kit";
import { redirect } from 'sveltekit-flash-message/server';

import { setFlash } from 'sveltekit-flash-message/server';

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { chargerSchema, importCsvSchema } from "$lib/server/config/zodSchemas";

import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import {
    chargerTable,
    companyTable,
    usersToCompaniesTable,
    chargingControllerTable,
    controllerDataTable,
    chargingSessionTable,
    userTable,
    profileTable,
    rfidTagTable
} from "$lib/server/db/schema";

export const load = async ({ parent, locals, params, cookies }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

    // Get the company record from database
    const [charger] = await db
        .select({
            charger: chargerTable,
            company: companyTable
        })
        .from(chargerTable)
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .where(eq(chargerTable.id, Number(params.chargerId)));

    const [userInCompany] = await db
        .select()
        .from(usersToCompaniesTable)
        .where(
            and(
                eq(usersToCompaniesTable.companyId, Number(charger.charger.companyId)),
                eq(usersToCompaniesTable.userId, user.id)
            )
        );

    // If the charger was not found or the user doesn't have the required permissions
    // redirect them to '/chargers'
    if (!charger || (!userInCompany && user.role != "ADMIN")) redirect(303, "/chargers", { type: "error", message: "Nabíjecí stanice nebyla nalezena" }, cookies);

    // Form for editing charger data
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
            controllerData: controllerDataTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
        .where(eq(chargingControllerTable.chargerId, charger.charger.id))
        .orderBy(asc(chargingControllerTable.chargingPointName));


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


    let chargingSessions: any[];

    // Dynamic query for getting chargers
    const sessionQuery = db
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
        .where(eq(chargerTable.id, Number(params.chargerId)))
        .orderBy(desc(chargingSessionTable.startTimestamp))
        .$dynamic();

    if (!userInCompany || userInCompany.role !== "Host") {
        // If the user is not an employee (is ADMIN) of the company
        // select all of the charger's charging sessions
        chargingSessions = await sessionQuery;

    } else if (userInCompany.rfidTag) {
        chargingSessions = await sessionQuery
            .where(
                and(
                    eq(chargerTable.id, Number(params.chargerId)),
                    eq(chargingSessionTable.rfidTag, userInCompany.rfidTag)
                )
            );
    } else {
        chargingSessions = [];
    }

    return {
        charger,
        chargingControllers,
        chargingSessions,
        companies,
        form,
        user,
        userInCompany
    }
}

export const actions = {
    chargerForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
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

        // Edit the charger
        await db
            .update(chargerTable)
            .set({
                name: form.data.name,
                description: form.data.description,
                companyId: form.data.companyId
            })
            .where(eq(chargerTable.id, Number(params.chargerId)));

        setFlash({ type: "success", message: "Nabíjecí stanice byla úspěšně upravena" }, cookies);
        return { form };
    },
};