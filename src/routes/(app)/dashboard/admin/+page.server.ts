import { error, fail } from "@sveltejs/kit";

import { redirect } from 'sveltekit-flash-message/server';

import { eq, and, lte, gte, count, sum, max, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, companyTable, chargingControllerTable, chargingSessionTable, controllerDataTable } from "$lib/server/db/schema";

export const load = async ({ locals, cookies }) => {
    const user = locals.user;

    if (!user) {
        redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
    }

    if (user.role !== "ADMIN") {
        redirect(401, "/dashboard");
    }

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
        .where(eq(controllerDataTable.connectedState, "disconnected"))
        .groupBy(chargerTable.id)
        .as("sqAvailable");

    const companies = await db
        .select({
            company: companyTable,
            chargerCount: max(sqCharger.chargerCount),
            controllerCount: max(sqController.controllerCount),
            availableCount: max(sqAvailable.availableCount)
        })
        .from(companyTable)
        .leftJoin(chargerTable, eq(companyTable.id, chargerTable.companyId))
        .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
        .leftJoin(sqCharger, eq(companyTable.id, sqCharger.companyId))
        .leftJoin(sqController, eq(chargerTable.id, sqController.chargerId))
        .leftJoin(sqAvailable, eq(chargerTable.id, sqAvailable.chargerId))
        .where(
            and(
                eq(controllerDataTable.connectedState, "connected"),
                gte(chargerTable.lastConnected, sql`timezone('utc', now()) - INTERVAL '3 minutes'`)
            )
        )
        .groupBy(companyTable.id);

    // Currently used controllers
    const usedControllers = await db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable,
            controllerData: controllerDataTable
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
        .where(
            and(
                eq(controllerDataTable.connectedState, "connected"),
                gte(chargerTable.lastConnected, sql`timezone('utc', now()) - INTERVAL '3 minutes'`)
            )
        );

    // Get charging data of last 30 days
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

    const chargingSessions = await db
        .select({
            company: companyTable.name,
            ico: companyTable.ic,
            description: chargerTable.description,
            chargingPointName: chargingControllerTable.chargingPointName,
            startTimestamp: chargingSessionTable.startTimestamp,
            endTimestamp: chargingSessionTable.endTimestamp,
            duration: chargingSessionTable.duration,
            startRealPower: chargingSessionTable.startRealPower,
            endRealPower: chargingSessionTable.endRealPower,
            consumption: chargingSessionTable.consumption,
            rfidTag: chargingSessionTable.rfidTag
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
        );

    return {
        user,
        companies,
        usedControllers,
        sessionChartData,
        totalConsumption,
        chargingSessions
    };
}