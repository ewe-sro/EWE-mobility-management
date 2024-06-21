import { error, json } from '@sveltejs/kit';

import { eq, and, or } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable, usersToCompaniesTable } from "$lib/server/db/schema";

import { fetchChargingData } from '$lib/server/utils.js';

export const GET = async ({ locals, params }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401);

    const [charger] = await db
        .select({
            charger: chargerTable,
            controller: chargingControllerTable
        })
        .from(chargerTable)
        .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .leftJoin(usersToCompaniesTable, eq(chargerTable.companyId, usersToCompaniesTable.companyId))
        .where(
            and(
                eq(chargerTable.id, Number(params.chargerId)),
                eq(chargingControllerTable.id, params.controllerId),
            )
        );

    // If user doesnt have access to the charger throw an error
    if (!charger) error(403);

    // Charging doesn't have the corresponding controller
    if (!charger.controller) error(404);

    if (!charger.charger.ipAddress || !charger.charger.restApiPort) error(404);
    const chargingData = await fetchChargingData(charger.charger.ipAddress, charger.charger.restApiPort, charger.controller.id);

    return json(await chargingData.json());
}