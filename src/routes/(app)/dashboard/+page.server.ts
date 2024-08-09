import { error, fail } from "@sveltejs/kit";

import { redirect } from 'sveltekit-flash-message/server';

import { eq, gte, count, sum, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, companyTable, chargingControllerTable, chargingSessionTable, controllerDataTable } from "$lib/server/db/schema";

export const load = async ({ locals, cookies }) => {
    const user = locals.user;

    if (!user) {
        redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

    if (user.role === "ADMIN") {
        redirect(303, "/dashboard/admin");
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

    const companies = await db
        .select({
            company: companyTable,
            chargerCount: count(chargerTable.id),
            controllerCount: sum(sqController.controllerCount),
            availableCount: sum(sqAvailable.availableCount)
        })
        .from(companyTable)
        .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
        .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
        .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
        .groupBy(companyTable.id)
        .orderBy(count(chargerTable.id));

    // Get todays charging sessions
    const sessionChartData = await db
        .select({
            charger: chargerTable,
            company: companyTable,
            consumption: sum(chargingSessionTable.consumption)
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(companyTable, eq(chargerTable.companyId, companyTable.id))
        .where(
            gte(
                sql`DATE(${chargingSessionTable.endTimestamp})`,
                sql`CURRENT_DATE - INTERVAL '30 days'`
            )
        )
        .groupBy((t) => [t.charger.id, t.company.id]);

    const totalConsumption = sessionChartData.reduce((sum, obj) => sum + Number(obj.consumption), 0);

    // Currently used controllers
    const usedControllers = await db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
        .where(eq(controllerDataTable.connectedState, "connected"))
        .limit(2);

    return {
        user,
        companies,
        sessionChartData,
        totalConsumption,
        usedControllers
    };
}