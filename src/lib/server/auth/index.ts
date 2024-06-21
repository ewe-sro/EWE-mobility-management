import { dev } from "$app/environment";

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { db } from "../db";
import { sessionTable, userTable } from "../db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` on production
			// secure: !dev
			secure: false
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			role: attributes.role,
			createdAt: attributes.createdAt
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

// 
interface DatabaseUserAttributes {
	email: string;
	role: string;
	createdAt: string;
}