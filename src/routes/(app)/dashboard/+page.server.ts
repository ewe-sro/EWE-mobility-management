import { error, fail } from "@sveltejs/kit";

import { redirect } from 'sveltekit-flash-message/server';

import { eq, and, or, asc, gte, count, sum, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, companyTable, chargingControllerTable, chargingSessionTable, controllerDataTable, usersToCompaniesTable, companyFollowTable } from "$lib/server/db/schema";

export const load = async ({ parent, locals }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

    // Subquery for getting number of chargers
    const sqCharger = db
        .select({
            companyId: companyTable.id,
            chargerCount: count(chargerTable.id).as("chargerCount")
        })
        .from(chargerTable)
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .groupBy(companyTable.id)
        .as("sqCharger");

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
        .where(
            and(
                eq(controllerDataTable.connectedState, "disconnected"),
                gte(chargerTable.lastConnected, sql`timezone('utc', now()) - INTERVAL '3 minutes'`)
            )
        )
        .groupBy(chargerTable.id)
        .as("sqAvailable");

    let companies;
    let chargers;
    let controllers;

    // Dynamic query for selecting companies
    const companyQuery = db
        .select({
            id: companyTable.id, // For drag and drop purposes
            company: companyTable,
            chargerCount: count(chargerTable.id),
            controllerCount: sum(sqController.controllerCount),
            availableCount: sum(sqAvailable.availableCount),
            userId: companyFollowTable.userId,
            isFollowed: sql<boolean>`CASE WHEN ${companyFollowTable.userId} = ${user.id} THEN true ELSE false END`
        })
        .from(companyTable)
        .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
        .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
        .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
        .leftJoin(sqCharger, eq(companyTable.id, sqCharger.companyId))
        .leftJoin(companyFollowTable, and(
            eq(companyFollowTable.companyId, companyTable.id),
            eq(companyFollowTable.userId, user.id)
        ))
        .where(
            gte(sqCharger.chargerCount, 1)
        )
        .groupBy((t) => [t.company.id, t.userId])
        .orderBy(
            sql`CASE WHEN ${companyFollowTable.userId} = ${user.id} THEN 0 ELSE 1 END`,
            asc(companyTable.name)
        )
        .$dynamic();

    // Dynamic query for selecting chargers
    const chargerQuery = db
        .select({
            charger: chargerTable
        })
        .from(chargerTable)
        .orderBy(chargerTable.name)
        .$dynamic();

    // Dynamic query for selecting controllers
    const controllerQuery = db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable,
            controllerData: controllerDataTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
        .orderBy(asc(chargerTable.description))
        .$dynamic();


    if (user.role === "ADMIN") {
        // Get all the data if the logged in user as ADMIN
        companies = await companyQuery;
        chargers = await chargerQuery;
        controllers = await controllerQuery;

    } else {
        // Get data that the logged in user is associated with
        companies = await companyQuery
            .leftJoin(usersToCompaniesTable, eq(companyTable.id, usersToCompaniesTable.companyId))
            .where(
                and(
                    gte(sqCharger.chargerCount, 1),
                    eq(usersToCompaniesTable.userId, user.id)
                )
            )

        chargers = await chargerQuery
            .leftJoin(usersToCompaniesTable, eq(chargerTable.companyId, usersToCompaniesTable.companyId))
            .where(
                or(
                    eq(usersToCompaniesTable.userId, user.id),
                    eq(chargerTable.userId, user.id)
                )
            );

        controllers = await controllerQuery
            .leftJoin(usersToCompaniesTable, eq(chargerTable.companyId, usersToCompaniesTable.companyId))
            .where(
                or(
                    eq(usersToCompaniesTable.userId, user.id),
                    eq(chargerTable.userId, user.id)
                )
            );
    }

    return {
        user,
        companies,
        chargers,
        controllers
    };
}