import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { eq, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargerTable, chargingControllerTable, controllerDataTable } from "$lib/server/db/schema";

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

    try {
        for (const controller in data) {
            // Upsert the controller data to the database
            const [newController] = await db
                .insert(chargingControllerTable)
                .values({
                    id: data[controller]["controller_uid"],
                    chargingPointId: data[controller]["charging_point_id"],
                    chargingPointName: data[controller]["charging_point_name"],
                    deviceName: data[controller]["device_name"],
                    parentDeviceUid: data[controller]["parent_device_uid"],
                    position: data[controller]["position"],
                    firmwareVersion: data[controller]["firmware_version"],
                    hardwareVersion: data[controller]["hardware_version"],
                    chargerId: charger.id
                })
                .onConflictDoUpdate({
                    target: chargingControllerTable.id,
                    set: {
                        chargingPointId: data[controller]["charging_point_id"],
                        chargingPointName: data[controller]["charging_point_name"],
                        deviceName: data[controller]["device_name"],
                        parentDeviceUid: data[controller]["parent_device_uid"],
                        position: data[controller]["position"],
                        firmwareVersion: data[controller]["firmware_version"],
                        hardwareVersion: data[controller]["hardware_version"]
                    }
                })
                .returning();

            // Upsert the controller energy data to the database
            await db
                .insert(controllerDataTable)
                .values({
                    iec61851State: data[controller]["charging_data"]["iec_61851_state"],
                    connectedState: data[controller]["charging_data"]["connected_state"],
                    apparentEnergy: data[controller]["charging_data"]["apparent_energy"]["value"],
                    energyRealPower: data[controller]["charging_data"]["energy_real_power"]["value"],
                    frequency: data[controller]["charging_data"]["frequency"]["value"],
                    partApparentEnergy: data[controller]["charging_data"]["part_apparent_energy"]["value"],
                    partEnergyRealPower: data[controller]["charging_data"]["part_energy_real_power"]["value"],
                    apparentPower: data[controller]["charging_data"]["apparent_power"]["value"],
                    realPower: data[controller]["charging_data"]["real_power"]["value"],
                    i1: data[controller]["charging_data"]["i1"]["value"],
                    i2: data[controller]["charging_data"]["i2"]["value"],
                    i3: data[controller]["charging_data"]["i3"]["value"],
                    u1: data[controller]["charging_data"]["u1"]["value"],
                    u2: data[controller]["charging_data"]["u2"]["value"],
                    u3: data[controller]["charging_data"]["u3"]["value"],
                    connectedTime: data[controller]["charging_data"]["connected_time_sec"],
                    chargeTime: data[controller]["charging_data"]["charge_time_sec"],
                    controllerId: newController.id
                })
                .onConflictDoUpdate({
                    target: controllerDataTable.controllerId,
                    set: {
                        iec61851State: data[controller]["charging_data"]["iec_61851_state"],
                        connectedState: data[controller]["charging_data"]["connected_state"],
                        apparentEnergy: data[controller]["charging_data"]["apparent_energy"]["value"],
                        energyRealPower: data[controller]["charging_data"]["energy_real_power"]["value"],
                        frequency: data[controller]["charging_data"]["frequency"]["value"],
                        partApparentEnergy: data[controller]["charging_data"]["part_apparent_energy"]["value"],
                        partEnergyRealPower: data[controller]["charging_data"]["part_energy_real_power"]["value"],
                        apparentPower: data[controller]["charging_data"]["apparent_power"]["value"],
                        realPower: data[controller]["charging_data"]["real_power"]["value"],
                        i1: data[controller]["charging_data"]["i1"]["value"],
                        i2: data[controller]["charging_data"]["i2"]["value"],
                        i3: data[controller]["charging_data"]["i3"]["value"],
                        u1: data[controller]["charging_data"]["u1"]["value"],
                        u2: data[controller]["charging_data"]["u2"]["value"],
                        u3: data[controller]["charging_data"]["u3"]["value"],
                        connectedTime: data[controller]["charging_data"]["connected_time_sec"],
                        chargeTime: data[controller]["charging_data"]["charge_time_sec"]
                    }
                });

            // Edit the charger's last connected time
            await db
                .update(chargerTable)
                .set({
                    lastConnected: sql`timezone('utc', now())`
                })
                .where(eq(chargerTable.id, charger.id));

        }

        return json({ success: true });

    } catch (error) {
        return json({ success: false, error: error });
    }
}