import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
    NODE_ENV,
    PROD_DB_HOST,
    PROD_DB_PORT,
    PROD_DB_USER,
    PROD_DB_PASSWORD,
    PROD_DB_NAME,
    DEV_DB_HOST,
    DEV_DB_PORT,
    DEV_DB_USER,
    DEV_DB_PASSWORD,
    DEV_DB_NAME
} from '$env/static/private';

let connectionString;

if (NODE_ENV === "production") {
    connectionString = `postgres://${PROD_DB_USER}:${PROD_DB_PASSWORD}@${PROD_DB_HOST}:${PROD_DB_PORT}/${PROD_DB_NAME}`;
} else {
    connectionString = `postgres://${DEV_DB_USER}:${DEV_DB_PASSWORD}@${DEV_DB_HOST}:${DEV_DB_PORT}/${DEV_DB_NAME}`;
}

export const connection = postgres(connectionString);
export const db = drizzle(connection);