import { relations } from "drizzle-orm";

// Import data types
import {
    integer, pgTable, serial, varchar, text, timestamp, boolean
} from "drizzle-orm/pg-core";

// Define database tables
export const chargerTable = pgTable("charger", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    description: text("description"),
    ipAddress: varchar("ip_address", { length: 50 }),
    mqttPort: integer("mqtt_port").default(1883),
    mqttUser: varchar("mqtt_user", { length: 75 }),
    mqttPassword: text("password"),
    restApiPort: integer("rest_api_port").default(5555),
});

export const chargingControllerTable = pgTable("charging_controller", {
    id: serial("id").primaryKey(),
    deviceUid: varchar("device_uid", { length: 10 }).notNull(),
    chargingPointName: varchar("charging_point_name", { length: 256 }),
    parentDeviceUid: varchar("parent_device_uid", { length: 10 }),
    position: integer("position"),
    chargerId: integer("charger_id").notNull().references(() => chargerTable.id)
});

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 75 }).notNull().unique(),
    password: text("password").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow()
});

// One to one relation with profileTable
export const userRelations = relations(userTable, ({ one }) => ({
    profile: one(profileTable, {
        fields: [userTable.id],
        references: [profileTable.userId]
    }),
}));

export const profileTable = pgTable("profile", {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    userId: text("user_id").notNull().references(() => userTable.id)
});

// Lucia authentication session table
export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => userTable.id),

    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});

export const passwordResetTable = pgTable("password_reset", {
    tokenHash: text("token_hash").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => userTable.id),

    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});