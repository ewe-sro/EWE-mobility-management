import { error, json } from '@sveltejs/kit';

import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable, chargingSessionTable } from "$lib/server/db/schema";

import { isEmptyNullOrUndefined, isBetweenDates, getSessionDuration } from '$lib/utils.js';

export const POST = async ({ request }) => {
    // Access specific headers
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.split("Bearer ")[1];

    if (!apiKey) {
        error(401, { message: "API key is missing" });
    }

    // Find the corresponding charger tied to the supplied API key
    const [charger] = await db
        .select()
        .from(chargerTable)
        .where(eq(chargerTable.apiKey, apiKey));

    if (!charger) {
        error(403);
    }

    // Access the request body (JSON data)
    const data = await request.json();

    // Check if controllerUid was supplied
    if (!data.deviceUid) {
        error(401, { message: "Device UID is missing" });
    }

    // Find the corresponding charging controller
    const [controller] = await db
        .select()
        .from(chargingControllerTable)
        .where(eq(chargingControllerTable.id, data.deviceUid));

    if (!controller) {
        error(403);
    }

    try {
        // Create a Date object from the supplied timestamps
        let startTimestamp = !data.startTimestamp ? null : new Date(data.startTimestamp + "Z");
        let endTimestamp = !data.endTimestamp ? null : new Date(data.endTimestamp + "Z");
        let rfidTimestamp = !data.rfidTimestamp ? null : new Date(data.rfidTimestamp + "Z");

        // If no endTimestamp was submitted (charging session started) create a new record
        if (!data.endTimestamp) {
            // Check if there is an open charging session
            const [session] = await db
                .select()
                .from(chargingSessionTable)
                .where(
                    and(
                        eq(chargingSessionTable.controllerId, data.deviceUid),
                        isNull(chargingSessionTable.endTimestamp)
                    )
                );

            if (!session) {
                await db
                    .insert(chargingSessionTable)
                    .values({
                        startRealPower: data.startRealPowerWh,
                        startTimestamp: startTimestamp,
                        rfidTag: data.rfidTag,
                        rfidTimestamp: rfidTimestamp,
                        controllerId: data.deviceUid
                    });
            }

        } else {
            await db.transaction(async (tx) => {
                // Get the session from the database
                const [session] = await tx
                    .select()
                    .from(chargingSessionTable)
                    .where(
                        and(
                            eq(chargingSessionTable.controllerId, data.deviceUid),
                            isNull(chargingSessionTable.endTimestamp)
                        )
                    );

                // Check if the session already has RFID tag and timestamp set
                if (isEmptyNullOrUndefined(session.rfidTag) && isEmptyNullOrUndefined(session.rfidTimestamp)) {
                    if (session.startTimestamp && endTimestamp && rfidTimestamp) {
                        // Check if the RFID datetime is between the start and end datetimes
                        const rfidValid = isBetweenDates(session.startTimestamp, endTimestamp, rfidTimestamp);

                        if (!rfidValid) {
                            data.rfidTag = null;
                            rfidTimestamp = null;
                        }
                    }

                } else {
                    // If the session already has RFID timestamp and RFID tag set keep them as is
                    data.rfidTag = session.rfidTag;
                    data.rfidTimestamp = session.rfidTimestamp;
                }

                // calculate the energy consumption and time duration of the session
                const consumption = data.endRealPowerWh - Number(session.startRealPower);
                const duration = getSessionDuration(session.startTimestamp, endTimestamp);

                await tx
                    .update(chargingSessionTable)
                    .set({
                        endRealPower: data.endRealPowerWh,
                        consumption: consumption,
                        endTimestamp: endTimestamp,
                        duration: duration,
                        rfidTag: data.rfidTag,
                        rfidTimestamp: rfidTimestamp
                    })
                    .where(
                        and(
                            eq(chargingSessionTable.controllerId, data.deviceUid),
                            isNull(chargingSessionTable.endTimestamp)
                        )
                    );
            });
        }

        // Edit the charger's last connected time
        await db
            .update(chargerTable)
            .set({
                lastConnected: sql`timezone('utc', now())`
            })
            .where(eq(chargerTable.id, charger.id));


        return json({ success: true });

    } catch (error) {
        return json({ success: false, error: error });
    }
}