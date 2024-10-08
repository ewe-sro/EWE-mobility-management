import { error, json } from '@sveltejs/kit';

import { produce } from "sveltekit-sse";

import { eq, and } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable, controllerDataTable, usersToCompaniesTable } from "$lib/server/db/schema";

const delay = (milliseconds: number) => {
    return new Promise(function run(resolve) {
        setTimeout(resolve, milliseconds)
    });
}

export const POST = async ({ locals, params }) => {
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

    // Charger doesn't have the corresponding controller
    if (!charger.controller) error(404);

    return produce(
        async function start({ emit }) {
            while (true) {
                // Get the charging controller data from the database
                const [chargingController] = await db
                    .select({
                        charger: chargerTable,
                        controller: chargingControllerTable,
                        controllerData: controllerDataTable
                    })
                    .from(chargingControllerTable)
                    .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
                    .leftJoin(controllerDataTable, eq(chargingControllerTable.id, controllerDataTable.controllerId))
                    .where(eq(chargingControllerTable.id, params.controllerId));

                const { error } = emit("charging-data", JSON.stringify(chargingController))

                if (error) {
                    return
                };

                await delay(1000);
            }
        },
        {
            stop() {
                return;
            }
        }
    );
}