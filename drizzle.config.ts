import 'dotenv/config'; // get environment variables
import { defineConfig } from "drizzle-kit";

let dbCredentials: {
  host: string | undefined;
  port: string | undefined;
  user: string | undefined;
  password: string | undefined;
  name: string | undefined;
};

// Declare the dbCredentials variable based on the environment
if (process.env.NODE_ENV === "production") {
  dbCredentials = {
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    name: process.env.PROD_DB_NAME
  };
} else {
  dbCredentials = {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    name: process.env.DEV_DB_NAME
  };
};

// Check if all neccessary credentials are set
if (
  typeof dbCredentials.host === "undefined" ||
  typeof dbCredentials.port === "undefined" ||
  typeof dbCredentials.user === "undefined" ||
  typeof dbCredentials.password === "undefined" ||
  typeof dbCredentials.name === "undefined"
) {
  throw new Error("Invalid database connection parameters");
}

export default defineConfig({
  dialect: "postgresql",
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: dbCredentials.host,
    port: Number(dbCredentials.port),
    user: dbCredentials.user,
    password: dbCredentials.password,
    database: dbCredentials.name
  },
});