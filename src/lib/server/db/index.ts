import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import 'dotenv/config'; // get environment variables

const dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
export const connection = postgres(dbUrl);

export const db = drizzle(connection);