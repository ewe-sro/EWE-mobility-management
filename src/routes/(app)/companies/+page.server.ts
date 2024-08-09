import { error, fail } from "@sveltejs/kit";

import { writeFile } from "fs";
import { extname } from 'path';

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { superValidate, withFiles, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { companySchema } from "$lib/server/config/zodSchemas";

import { count, sum, eq, and, gte, sql, lt } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { companyTable, chargerTable, chargingControllerTable, usersToCompaniesTable, chargingSessionTable, controllerDataTable } from "$lib/server/db/schema";

import { generateId } from 'lucia';

export const load = async ({ locals, cookies }) => {
    if (!locals.user) {
        redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
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
            availableCount: count(controllerDataTable.id).as("availableCount")
        })
        .from(controllerDataTable)
        .leftJoin(chargingControllerTable, eq(controllerDataTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(controllerDataTable.connectedState, "disconnected"))
        .groupBy(chargerTable.id)
        .as("sqAvailable");


    let companies;
    let employeeCount;

    if (locals.user.role === "ADMIN") {
        // Get all companies if the logged in user is ADMIN
        companies = await db
            .select({
                companyTable,
                chargerCount: count(chargerTable.id),
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.availableCount)
            })
            .from(companyTable)
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);

        employeeCount = await db
            .select({
                companyId: usersToCompaniesTable.companyId,
                count: count(usersToCompaniesTable.userId)
            })
            .from(usersToCompaniesTable)
            .groupBy(usersToCompaniesTable.companyId);

    } else {
        // Get companies that the logged in user is associated with
        companies = await db
            .select({
                companyTable,
                chargerCount: count(chargerTable.id),
                controllerCount: sum(sqController.controllerCount),
                availableCount: sum(sqAvailable.availableCount)
            })
            .from(companyTable)
            .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
            .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
            .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, companyTable.id))
            .where(eq(usersToCompaniesTable.userId, locals.user.id))
            .groupBy(companyTable.id)
            .orderBy(companyTable.name);

        employeeCount = await db
            .select({
                companyId: usersToCompaniesTable.companyId,
                count: count(usersToCompaniesTable.userId)
            })
            .from(usersToCompaniesTable)
            .groupBy(usersToCompaniesTable.companyId)
            .where(eq(usersToCompaniesTable.userId, locals.user.id));
    }

    // Create a dataset for graph
    interface ChargingSubdata {
        "thisMonth": any,
        "lastMonth": any,
        "graph": any[]
    }

    interface ChargingData {
        [companyId: number]: ChargingSubdata
    }

    let chargingData: ChargingData = {};

    for (const company of companies) {
        // Get the sum of charging data of this and last 30 days
        const [thisMonth] = await db
            .select({
                chargingData: sum(chargingSessionTable.consumption)
            })
            .from(chargingSessionTable)
            .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .where(
                and(
                    eq(chargerTable.companyId, company.companyTable.id),
                    gte(chargingSessionTable.endTimestamp, sql`CURRENT_DATE - INTERVAL '30 days'`)
                )
            );

        const [lastMonth] = await db
            .select({
                chargingData: sum(chargingSessionTable.consumption)
            })
            .from(chargingSessionTable)
            .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
            .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
            .where(
                and(
                    eq(chargerTable.companyId, company.companyTable.id),
                    gte(chargingSessionTable.endTimestamp, sql`CURRENT_DATE - INTERVAL '60 days'`),
                    lt(chargingSessionTable.endTimestamp, sql`CURRENT_DATE - INTERVAL '30 days'`)
                )
            );

        // Subquery for getting charging data for current company
        const sq = sql`
            SELECT
                session.consumption as consumption,
                session.end_timestamp as end_timestamp
            FROM
                ${chargingSessionTable} session
            LEFT JOIN
                ${chargingControllerTable} controller
            ON
                session.controller_id = controller.id
            LEFT JOIN
                ${chargerTable} charger
            ON
                controller.charger_id = charger.id
            WHERE
                charger.company_id = ${Number(company.companyTable.id)} AND
                session.end_real_power IS NOT NULL AND
                session.end_timestamp >= CURRENT_DATE - INTERVAL '30 days'`;

        const query = sql`
            WITH date_series AS (
                SELECT generate_series(
                  current_date - interval '30 days',
                  current_date - interval '0 day',
                  interval '1 day'
              )::date AS id
            )
            SELECT 
              ds.id,
              COALESCE(SUM(session.consumption), 0) AS used_energy
            FROM 
              date_series ds
            LEFT JOIN 
              (${sq}) session
            ON 
              ds.id = session.end_timestamp::date
            GROUP BY 
              ds.id
            ORDER BY 
              ds.id;
        `;

        const graphData = await db
            .execute(query);

        chargingData[company.companyTable.id] = {
            thisMonth: thisMonth.chargingData,
            lastMonth: lastMonth.chargingData,
            graph: graphData,
        };
    }

    const form = await superValidate(zod(companySchema));

    return {
        companies: companies,
        chargingData: chargingData,
        employeeCount: employeeCount,
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