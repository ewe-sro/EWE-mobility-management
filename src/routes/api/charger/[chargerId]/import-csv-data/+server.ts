import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { eq, and, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargingSessionTable, chargingControllerTable } from "$lib/server/db/schema";

import { convertTimeToSeconds } from '$lib/utils.js';

const isISOString = (str: string): boolean => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
    return isoRegex.test(str);
}

const isISOStringWithoutTimezone = (str: string): boolean => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/;
    return isoRegex.test(str);
}

const verifyTimestampFormat = (timestamp: string) => {
    if (isISOString(timestamp)) {
        return new Date(timestamp);
    } else if (isISOStringWithoutTimezone(timestamp)) {
        return new Date(timestamp + "Z");
    } else if (timestamp.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)) {
        // The timestamp is in this format: "2024-03-08 17:02:13" (missing the 'T')
        return new Date(timestamp + "Z");
    } else {
        return null;
    }
}

export const POST = async ({ request, locals, params, cookies }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" });

    // Access the request body (JSON data)
    const data = await request.json();

    // If the supplied data doesn't have 'apiData' return error
    if (!data.apiData) {
        setFlash({ type: 'error', message: 'Struktura CSV souboru je nesprávná' }, cookies);
        return json({ success: false });
    }

    // Required column names and options for the correct data structure
    interface RequiredColumns {
        controllerId: string | string[],
        startTimestamp: string,
        endTimestamp: string,
        duration: string,
        startRealPower: string | string[],
        endRealPower: string | string[],
        consumption: string | string[],
        rfidTag: string,
        rfidTimestamp: string
    }

    const requiredColumnNames: RequiredColumns = {
        controllerId: ["controllerId", "deviceUid"],
        startTimestamp: "startTimestamp",
        endTimestamp: "endTimestamp",
        duration: "duration",
        startRealPower: ["startRealPower", "startRealPowerWh"],
        endRealPower: ["endRealPower", "endRealPowerWh"],
        consumption: ["consumption", "consumptionWh"],
        rfidTag: "rfidTag",
        rfidTimestamp: "rfidTimestamp"
    };

    // For TypeScript validity
    type StringOnly<T> = {
        [K in keyof T]: string;
    };

    // Names of the columns used in the data
    let usedColumns = {} as StringOnly<RequiredColumns>;

    // Check if the data structure is correct
    for (const column in requiredColumnNames) {
        // For TypeScript validity
        const columnKey = column as keyof RequiredColumns;

        // get the object keys (column names) from the first row of the data
        const dataColumns = Object.keys(data.apiData[0]);

        switch (typeof requiredColumnNames[columnKey]) {
            case "string":
                // Value from requiredColumnNames is a string = only 1 option
                if (!dataColumns.includes(requiredColumnNames[columnKey])) {
                    // Some of the required columns are missing in the data
                    // return an error
                    setFlash({ type: 'error', message: 'Nahraný soubor má nesprávnou strukturu dat' }, cookies);
                    return json({ success: false });
                }

                // Note the name of the used column 
                usedColumns[columnKey] = columnKey;

                break;

            case "object":
                // Value from requiredColumnNames is an array = multiple options

                // Check if one of the options is present in the data
                const columnExists = dataColumns.filter(e => requiredColumnNames[columnKey].includes(e));

                if (!columnExists) {
                    // Some of the required columns are missing in the data
                    // return an error
                    setFlash({ type: 'error', message: 'Nahraný soubor má nesprávnou strukturu dat' }, cookies);
                    return json({ success: false });
                }

                // Note the name of the used column 
                usedColumns[columnKey] = columnExists[0];
        }
    }

    // Used for tracking the number of imported rows
    let importedRows = 0;

    // Loop over the data and save them to database
    for (const row of data.apiData) {
        // Check if the supplied data belongs to current charger

        // If controllerId is undefined go to the next item in the loop
        if (!row[usedColumns.controllerId]) continue;

        const controller = await db
            .select()
            .from(chargingControllerTable)
            .where(
                and(
                    eq(chargingControllerTable.id, row[usedColumns.controllerId]),
                    eq(chargingControllerTable.chargerId, Number(params.chargerId))
                )
            );

        // If no corresponding controller was found go to the next item in the loop
        if (controller.length === 0) continue;

        // Verify the timestamps and treat the value accordingly
        const startTimestamp = verifyTimestampFormat(row[usedColumns.startTimestamp]);
        const endTimestamp = verifyTimestampFormat(row[usedColumns.endTimestamp]);
        const rfidTimestamp = verifyTimestampFormat(row[usedColumns.rfidTimestamp]);

        if (!startTimestamp) continue;

        // Check if the charging session is already in the database
        // in the WHERE statement we're checking if there is a session
        // that has more or less (30 seconds) the same startTimestamp
        const session = await db
            .select()
            .from(chargingSessionTable)
            .where(
                sql`ABS(EXTRACT(EPOCH FROM (${startTimestamp.toISOString()} - ${chargingSessionTable.startTimestamp}))) <= 30`
            );

        // If charging session was found (already is in the db) go to the next item in the loop
        if (session.length >= 1) continue;

        // If the currently imported charging session doesn't have endTimestamp (is still going on)
        // go to the next item in the loop
        if (!row[usedColumns.endTimestamp] || row[usedColumns.endTimestamp] === "") continue;

        // Convert the duration value to seconds if needed (could be in 'X day(s), hh:mm:ss' or 'hh:mm:ss' format)
        let duration;

        if (row[usedColumns.duration].match(/^(?:(\d+)\s*(?:days?|d),?\s*)?(?:(\d+):)?(\d+):(\d+)$/)) {
            // If the duration value matches this regex: 'X day(s) hh:mm:ss'
            duration = convertTimeToSeconds(row[usedColumns.duration]);
        } else if (!Number.isNaN(Number(row[usedColumns.duration]))) {
            // If the duration value is a number don't do anything
            duration = row[usedColumns.duration];
        } else {
            // If the duration value is not valid go to the next item in the loop
            continue;
        }

        // If consumption is negative number go to the next item in the loop
        if (Number(row[usedColumns.consumption]) < 0) continue;

        // Add the imported session to the db
        await db
            .insert(chargingSessionTable)
            .values({
                startRealPower: row[usedColumns.startRealPower],
                endRealPower: row[usedColumns.endRealPower],
                consumption: row[usedColumns.consumption],
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp,
                duration: duration,
                rfidTag: row[usedColumns.rfidTag],
                rfidTimestamp: rfidTimestamp,
                controllerId: row[usedColumns.controllerId]
            });

        // Add +1 to the number of imported rows
        importedRows = importedRows + 1;
    }

    if (importedRows === 0) {
        setFlash({ type: 'error', message: `Žádné nabíjecí relace nebyly importovány` }, cookies);
    } else {
        setFlash({ type: 'success', message: `Nabíjecí relace byly importovány (${importedRows} záznamů)` }, cookies);
    }

    return json({ success: true });
}