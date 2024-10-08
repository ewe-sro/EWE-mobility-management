import { error, fail } from "@sveltejs/kit";

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { superValidate, withFiles, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { companySchema } from "$lib/server/config/zodSchemas";

import { count, sum, eq, and, gte, sql, lt } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { companyTable, chargerTable, chargingControllerTable, usersToCompaniesTable, chargingSessionTable, controllerDataTable } from "$lib/server/db/schema";

export const load = async ({ parent, locals }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

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

    // Subquery for getting number of employees in company
    const sqEmployee = db
        .select({
            companyId: usersToCompaniesTable.companyId,
            employeeCount: count(usersToCompaniesTable.userId).as("employeeCount")
        })
        .from(usersToCompaniesTable)
        .groupBy(usersToCompaniesTable.companyId)
        .as("sqEmployee");

    let companies;

    // Dynamic query for selecting companies
    const companyQuery = db
        .select({
            companyTable,
            chargerCount: count(chargerTable.id),
            controllerCount: sum(sqController.controllerCount),
            availableCount: sum(sqAvailable.availableCount),
            employeeCount: sum(sqEmployee.employeeCount),
        })
        .from(companyTable)
        .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
        .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
        .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
        .leftJoin(sqEmployee, eq(companyTable.id, sqEmployee.companyId))
        .groupBy(companyTable.id)
        .orderBy(companyTable.name)
        .$dynamic();

    if (user.role === "ADMIN") {
        // Get all companies if the logged in user as ADMIN
        companies = await companyQuery;

    } else {
        // Get companies that the logged in user is associated with
        companies = await companyQuery
            .leftJoin(usersToCompaniesTable, eq(usersToCompaniesTable.companyId, companyTable.id))
            .where(eq(usersToCompaniesTable.userId, user.id));
    }

    // Create TypeScript interfaces for chargingData variable
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

    // Form for adding a company
    const form = await superValidate(zod(companySchema));

    return {
        companies,
        chargingData,
        user,
        form
    };
}

export const actions = {
    default: async ({ request, locals, cookies }) => {
        const user = locals.user;

        if (!user) {
            error(401, { message: "K provedení této akce se musíte přihlásit." });
        }

        if (user.role !== "ADMIN") {
            error(403, { message: "Nemáte oprávnění k této akci." });
        }

        // get form data and validate them
        const form = await superValidate(request, zod(companySchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400);
        }

        // Check if company with same IČO is already in the database
        const [companyExists] = await db
            .select()
            .from(companyTable)
            .where(eq(companyTable.ic, form.data.ic));

        if (companyExists) {
            return message(form, "Společnost s tímto IČO je již přidána");
        }

        // Add the data to database
        await db.insert(companyTable).values({
            name: form.data.name,
            ic: form.data.ic,
            dic: form.data.dic,
            city: form.data.city,
            street: form.data.street,
            zip: form.data.zip
        });

        setFlash({ type: "success", message: "Společnost byla úspěšně přidána" }, cookies);
        return withFiles({ form });
    },
};