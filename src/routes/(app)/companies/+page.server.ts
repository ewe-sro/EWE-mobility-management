import { error, fail } from "@sveltejs/kit";

import { writeFile } from "fs";
import { extname } from 'path';

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { superValidate, withFiles, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { companySchema } from "$lib/server/config/zodSchemas";

import { count, sum, eq, isNotNull, and, asc, gte, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { companyTable, chargerTable, chargingControllerTable, lastKnownStateTable, usersToCompaniesTable, chargingSessionTable } from "$lib/server/db/schema";

import { generateId } from 'lucia';

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

    // Subquery for getting number of charging controllers
    const sqAvailable = await db
        .select({
            chargerId: chargerTable.id,
            availableCount: count(lastKnownStateTable.id).as("availableCount")
        })
        .from(lastKnownStateTable)
        .leftJoin(chargingControllerTable, eq(chargingControllerTable.id, lastKnownStateTable.controllerId))
        .leftJoin(chargerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .where(eq(lastKnownStateTable.state, "disconnected"))
        .groupBy(chargerTable.id)
        .as("sqAvailable");

    let companies;
    if (locals.user?.role === "ADMIN") {
        // Get all companies if the logged in user is ADMIN
        companies = await db
            .select({
                companyTable,
                chargerCount: count(chargerTable.id),
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.availableCount),
                employeeCount: count(usersToCompaniesTable.companyId)
            })
            .from(companyTable)
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);

    } else {
        // Get companies that the logged in user is associated with
        companies = await db
            .select({
                companyTable,
                chargerCount: count(chargerTable.id),
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.availableCount),
                employeeCount: count(usersToCompaniesTable.companyId)
            })
            .from(companyTable)
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, companyTable.id))
            .where(eq(usersToCompaniesTable.userId, locals.user.id))
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);
    }

    // Create a dataset for graph
    interface GraphData {
        usedEnergy: string | null,
        id: Date | null
    }

    interface ChargingData {
        [companyId: number]: GraphData[]
    }

    let chargingData: ChargingData = {};

    for (const company of companies) {

        // Get all charging data where the company record is not null
        const graphData = await db
            .select({
                usedEnergy: sum(chargingSessionTable.consumption),
                id: chargingSessionTable.endTimestamp
            })
            .from(chargingSessionTable)
            .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .where(
                and(
                    eq(chargerTable.companyId, company.companyTable.id),
                    isNotNull(chargingSessionTable.endRealPower),
                    gte(chargingSessionTable.endTimestamp, sql`CURRENT_DATE - INTERVAL '30 days'`)
                )
            )
            .groupBy(chargingSessionTable.endTimestamp)
            .orderBy(asc(chargingSessionTable.endTimestamp));

        chargingData[company.companyTable.id] = graphData;
    }

    const form = await superValidate(zod(companySchema));

    return {
        companies: companies,
        chargingData: chargingData,
        user: locals.user,
        form: form
    };
}

export const actions = {
    default: async ({ request, locals, cookies }) => {
        if (!locals.user) {
            error(401, { message: "K provedení této akce se musíte přihlásit" });
        }

        if (locals.user.role !== "ADMIN") {
            error(403, { message: "Nemáte oprávnění k této akci" });
        }

        // get form data and validate them
        const form = await superValidate(request, zod(companySchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, withFiles({ form }));
        }

        // Check if company with same IČO is already in the database
        const [companyExists] = await db
            .select()
            .from(companyTable)
            .where(eq(companyTable.ic, form.data.ic));

        if (companyExists) {
            return message(form, "Společnost s tímto IČO je již přidána");
        }

        // If company logo was submitted save it
        if (form.data.logo) {
            const logoId = generateId(6);

            const fileName = `${logoId}${extname(form.data.logo.name)}`;
            const filePath = `static/images/logos/${fileName}`;

            // Write the file to $lib/assets/images/logos
            writeFile(filePath, Buffer.from(await form.data.logo.arrayBuffer()), err => {
                if (err) {
                    console.log(err);
                    error(500, { message: "Něco se nepovedlo. Zkuste to prosím znovu." });
                }
            });

            // Add the data to database
            await db.insert(companyTable).values({
                name: form.data.name,
                ic: form.data.ic,
                dic: form.data.dic,
                city: form.data.city,
                street: form.data.street,
                zip: form.data.zip,
                logo: fileName
            });
        } else {
            // Add the data to database
            await db.insert(companyTable).values({
                name: form.data.name,
                ic: form.data.ic,
                dic: form.data.dic,
                city: form.data.city,
                street: form.data.street,
                zip: form.data.zip
            });
        }

        setFlash({ type: "success", message: "Společnost byla úspěšně přidána" }, cookies);
        return withFiles({ form });
    },
};