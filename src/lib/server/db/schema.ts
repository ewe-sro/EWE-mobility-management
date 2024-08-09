import { relations, sql } from "drizzle-orm";

// Import data types
import {
    integer, decimal, pgTable, serial, varchar, text, timestamp, primaryKey,
    boolean
} from "drizzle-orm/pg-core";

// Define database tables
export const chargerTable = pgTable("charger", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    description: text("description"),
    apiKey: text("api_key"),
    lastConnected: timestamp("last_connected", {
        withTimezone: false,
        mode: "date"
    }),
    companyId: integer("company_id").references(() => companyTable.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
});

export const chargingControllerTable = pgTable("charging_controller", {
    id: text("id").primaryKey(),
    chargingPointId: integer("charging_point_id"),
    chargingPointName: varchar("charging_point_name", { length: 256 }),
    deviceName: varchar("device_name", { length: 256 }),
    parentDeviceUid: varchar("parent_device_uid", { length: 10 }),
    position: integer("position"),
    firmwareVersion: varchar("firmware_version", { length: 50 }),
    hardwareVersion: varchar("hardware_version", { length: 50 }),
    chargerId: integer("charger_id").notNull().references(() => chargerTable.id, { onDelete: 'cascade' })
});

export const controllerDataTable = pgTable("controller_data", {
    id: serial("id").primaryKey(),
    connectedState: varchar("connected_state", { length: 20 }),
    apparentEnergy: decimal("apparent_energy"),
    energyRealPower: decimal("energy_real_power"),
    frequency: decimal("frequency"),
    partApparentEnergy: decimal("part_apparent_energy"),
    partEnergyRealPower: decimal("part_energy_real_power"),
    apparentPower: decimal("apparent_power"),
    realPower: decimal("real_power"),
    i1: decimal("i1"),
    i2: decimal("i2"),
    i3: decimal("i3"),
    u1: decimal("u1"),
    u2: decimal("u2"),
    u3: decimal("u3"),
    connectedTime: integer("connected_time"),
    chargeTime: integer("charge_time"),
    controllerId: text("controller_id").notNull().unique().references(() => chargingControllerTable.id, { onDelete: 'cascade' })
});

export const chargingSessionTable = pgTable("charging_session", {
    id: serial("id").primaryKey(),
    startRealPower: decimal("start_real_power"),
    endRealPower: decimal("end_real_power"),
    consumption: decimal("consumption").$type<number>(),
    startTimestamp: timestamp("start_timestamp", {
        withTimezone: false,
        mode: "date"
    }),
    endTimestamp: timestamp("end_timestamp", {
        withTimezone: false,
        mode: "date"
    }),
    duration: integer("duration"),
    rfidTag: text("rfid_tag"),
    rfidTimestamp: timestamp("rfid_timestamp", {
        withTimezone: false,
        mode: "date"
    }),
    controllerId: text("controller_id").notNull().references(() => chargingControllerTable.id, { onDelete: 'cascade' })
});

export const companyTable = pgTable("company", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    ic: varchar("ic", { length: 20 }).notNull(),
    dic: varchar("dic", { length: 20 }),
    city: varchar("city", { length: 200 }),
    street: varchar("street", { length: 100 }),
    zip: varchar("zip", { length: 20 }),
    logo: text("logo"),
    logoHeight: integer("logo_height"),
    logoWidth: integer("logo_width")
});

export const rfidTagTable = pgTable("rfid_tag", {
    id: serial("id").primaryKey(),
    tag: text("tag"),
    validTill: timestamp("valid_till", {
        withTimezone: false,
        mode: "date"
    }),
    description: text("description"),
    companyId: integer("company_id").references(() => companyTable.id)
});

export const companyRelations = relations(companyTable, ({ many }) => ({
    usersToCompanies: many(usersToCompaniesTable),
}));

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 75 }).notNull().unique(),
    password: text("password").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("USER"),
    createdAt: timestamp("created_at", {
        withTimezone: false,
        mode: "date"
    }).notNull().default(sql`timezone('utc', now())`)
});

export const usersRelations = relations(userTable, ({ many }) => ({
    usersToCompanies: many(usersToCompaniesTable)
}));


export const usersToCompaniesTable = pgTable('users_to_companies', {
    userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    role: varchar("role", { length: 50 }),
    rfidTag: text("rfid_tag"),
    rfidValidTill: timestamp("rfid_valid_til", {
        withTimezone: false,
        mode: "date"
    }),
    companyId: integer('company_id').notNull().references(() => companyTable.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.companyId, table.userId] })
    }
});

// Many-to-many 
export const usersToCompaniesRelations = relations(usersToCompaniesTable, ({ one }) => ({
    group: one(companyTable, {
        fields: [usersToCompaniesTable.companyId],
        references: [companyTable.id],
    }),
    user: one(userTable, {
        fields: [usersToCompaniesTable.userId],
        references: [userTable.id],
    }),
}));


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
    userId: text("user_id").notNull().references(() => userTable.id, { onDelete: 'cascade' })
});

// Lucia authentication session table
export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp("expires_at", {
        withTimezone: false,
        mode: "date"
    }).notNull()
});

export const passwordResetTable = pgTable("password_reset", {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp("expires_at", {
        withTimezone: false,
        mode: "date"
    }).notNull()
});

export const registerInvitationTable = pgTable("register_invitation", {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 75 }).notNull().unique(),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    companyId: integer("company_id").references(() => companyTable.id),
    userId: text("user_id")
        .references(() => userTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at", {
        withTimezone: false,
        mode: "date"
    }).notNull().default(sql`timezone('utc', now())`),
    expiresAt: timestamp("expires_at", {
        withTimezone: false,
        mode: "date"
    }).notNull()
});