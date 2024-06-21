import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable } from "$lib/server/db/schema";

// API URL: /api/v1.0/web/reboot-all

export const POST = async ({ locals, params, cookies }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" });

    // Get the charging controllers of the charger
    const controllers = await db
        .select({
            controller: chargingControllerTable,
            charger: chargerTable,
        })
        .from(chargerTable)
        .leftJoin(chargingControllerTable, eq(chargerTable.id, chargingControllerTable.chargerId))
        .where(eq(chargerTable.id, Number(params.chargerId)));

    // Restart all controllers of the charger
    let restarted = true;

    for (const controller of controllers) {
        // API call URL
        const apiUrl = `http://${controller.charger.ipAddress}:${controller.charger.restApiPort}/api/v1.0/charging-controllers/${controller.controller?.id}/restart`;

        const response = await fetch(apiUrl, {
            method: 'POST'
        });

        if (!response.ok) {
            restarted = false;
        }
    }

    if (!restarted) {
        setFlash({ type: 'error', message: "Jeden nebo více nabíjecích bodů se nepodařilo restartovat" }, cookies);
        return json({ success: false });
    }

    setFlash({ type: 'success', message: "Nabíjecí body se restartují, během několika minut budou znovu k dispozici" }, cookies);
    return json({ success: true });
}