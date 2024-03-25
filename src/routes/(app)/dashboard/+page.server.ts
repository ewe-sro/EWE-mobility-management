import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { chargingControllerTable } from "$lib/server/db/schema";

export const load = async () => {
    const controllers = await db
        .select()
        .from(chargingControllerTable);

    return { controllers };
}