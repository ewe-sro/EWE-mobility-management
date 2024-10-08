import { fail, error } from "@sveltejs/kit";

import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { generateId } from "lucia";

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { companySchema, userSchema, chargerSchema, employeeSchema, employeeRfidSchema, otherRfidSchema } from "$lib/server/config/zodSchemas";

import { eq, ne, count, sum, avg, and, or, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import {
    companyTable,
    usersToCompaniesTable,
    chargerTable,
    chargingControllerTable,
    chargingSessionTable,
    userTable,
    profileTable,
    rfidTagTable,
    controllerDataTable
} from "$lib/server/db/schema";

const companyEditSchema = companySchema.omit({
    logo: true,
});

export const load = async ({ parent, locals, params, cookies }) => {
    // Wait for the +layout.server.ts load function for route protection
    await parent();

    // Tell TypeScript locals.user is not null
    const user = locals.user!;

    // Check if the logged in user has access
    const [userInCompany] = await db
        .select()
        .from(usersToCompaniesTable)
        .where(
            and(
                eq(usersToCompaniesTable.userId, user.id),
                eq(usersToCompaniesTable.companyId, Number(params.companyId))
            )
        );

    if (user.role !== "ADMIN" && !userInCompany) {
        // If the logged in user is not an ADMIN and is not an employee of the company redirect to /companies
        redirect(303, "/companies", { type: "error", message: "Společnost nebyla nalezena" }, cookies);
    }

    // Get the company record from database
    const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.id, Number(params.companyId)));

    // Create forms
    const companyForm = await superValidate(company, zod(companyEditSchema));
    const employeeForm = await superValidate(zod(employeeSchema));
    const chargerForm = await superValidate(zod(chargerSchema));
    const employeeRfidForm = await superValidate(zod(employeeRfidSchema));
    const otherRfidForm = await superValidate(zod(otherRfidSchema));

    const [companyPermission] = await db
        .select()
        .from(usersToCompaniesTable)
        .where(eq(usersToCompaniesTable.userId, user.id));

    if (!company || !companyPermission && user.role != "ADMIN") redirect(303, "/companies", { type: "error", message: "Společnost nebyla nalezena" }, cookies);

    // Get the number of chargers the company has
    const [chargerCount] = await db
        .select({
            chargerCount: count(chargerTable.id)
        })
        .from(chargerTable)
        .where(eq(chargerTable.companyId, company.id));

    // Get the number of charging controllers the company has
    const [controllerCount] = await db
        .select({
            controllerCount: count(chargerTable.id)
        })
        .from(chargingControllerTable)
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargerTable.companyId, company.id));

    // Get the number of chargers the company has
    const [availableCount] = await db
        .select({
            availableCount: count(controllerDataTable.id)
        })
        .from(controllerDataTable)
        .leftJoin(chargingControllerTable, eq(controllerDataTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(
            and(
                eq(chargerTable.companyId, company.id),
                eq(controllerDataTable.connectedState, "disconnected")
            ));

    // Get last 10 charging sessions
    let chargingSessions: any[];

    const sessionsQuery = db
        .select({
            chargingSession: chargingSessionTable,
            charger: chargerTable,
            controller: chargingControllerTable
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargerTable.companyId, company.id))
        .orderBy(desc(chargingSessionTable.startTimestamp))
        .limit(10)
        .$dynamic();

    if (user.role === "ADMIN" || userInCompany.role !== "Host") {
        // If logged in user is admin, manager or employee
        // show the last 10 charging session
        chargingSessions = await sessionsQuery;

    } else if (userInCompany.rfidTag) {
        // If the logged in user has RFID set
        // search for charging sessions that have the corresponding RFID
        chargingSessions = await sessionsQuery
            .where(and(
                eq(chargerTable.companyId, company.id),
                eq(chargingSessionTable.rfidTag, userInCompany.rfidTag)
            ));
    } else {
        chargingSessions = [];
    }

    // Get charging stats
    const [chargingStats] = await db
        .select({
            sessionCount: count(chargingSessionTable.id),
            sessionSum: sum(chargingSessionTable.consumption),
            sessionAverage: avg(chargingSessionTable.consumption)
        })
        .from(chargingSessionTable)
        .leftJoin(chargingControllerTable, eq(chargingSessionTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargerTable.companyId, company.id));

    // Get company chargers
    const chargers = await db
        .select({
            charger: chargerTable,
            controllerCount: count(chargingControllerTable.id)
        })
        .from(chargerTable)
        .leftJoin(chargingControllerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(eq(chargerTable.companyId, company.id))
        .groupBy(chargerTable.id);

    // Get company employees
    const employees = await db
        .select({
            id: userTable.id,
            email: userTable.email,
            firstName: profileTable.firstName,
            lastName: profileTable.lastName,
            role: usersToCompaniesTable.role,
            rfidTag: usersToCompaniesTable.rfidTag
        })
        .from(userTable)
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId))
        .leftJoin(usersToCompaniesTable, eq(userTable.id, usersToCompaniesTable.userId))
        .where(
            eq(usersToCompaniesTable.companyId, company.id),
        );

    // Get users to display in employeeForm
    const users = await db
        .select({
            user: userTable,
            profile: profileTable
        })
        .from(userTable)
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId));

    // Get companies to display in chargerForm
    const companies = await db
        .select({
            company: companyTable
        })
        .from(companyTable);

    // Get companies RFID tags
    const rfidTags = await db
        .select()
        .from(rfidTagTable)
        .where(eq(rfidTagTable.companyId, company.id));

    return {
        user: user,
        userInCompany: userInCompany,
        users: users,
        company: company,
        companies: companies,
        employees: employees,
        chargers: chargers,
        rfidTags: rfidTags,
        chargerCount: chargerCount.chargerCount,
        controllerCount: controllerCount.controllerCount,
        availableCount: availableCount.availableCount,
        chargingSessions: chargingSessions,
        chargingStats: chargingStats,
        companyForm: companyForm,
        employeeForm: employeeForm,
        chargerForm: chargerForm,
        employeeRfidForm: employeeRfidForm,
        otherRfidForm: otherRfidForm
    };
}

export const actions = {
    companyForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(companyEditSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        await db
            .update(companyTable)
            .set({
                name: form.data.name,
                ic: form.data.ic,
                dic: form.data.dic,
                city: form.data.city,
                street: form.data.street,
                zip: form.data.zip
            })
            .where(eq(companyTable.id, Number(params.companyId)));

        setFlash({ type: "success", message: "Společnost byla úspěšně upravena" }, cookies);
        return { form };
    },

    chargerForm: async ({ request, locals, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        if (locals.user.role !== "ADMIN") {
            error(403, { message: "Nemáte oprávnění k této akci" });
        }

        // get form data and validate them
        const form = await superValidate(request, zod(chargerSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // generate API key
        const apiKey = generateId(20);

        // Add the charger to the database
        await db
            .insert(chargerTable)
            .values({
                name: form.data.name,
                description: form.data.description,
                companyId: form.data.companyId,
                apiKey: apiKey
            });

        setFlash({ type: "success", message: "Nabíjecí stanice byla úspěšně přidána" }, cookies);
        return message(form, apiKey);
    },

    employeeForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(employeeSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        const [userInCompany] = await db
            .select()
            .from(usersToCompaniesTable)
            .where(
                and(
                    eq(usersToCompaniesTable.companyId, Number(params.companyId)),
                    eq(usersToCompaniesTable.userId, form.data.userId)
                )
            )

        // Check if submitted user is already asociated with company
        if (userInCompany) {
            return message(form, "Vybraný uživatel je již přiřazen k této společnosti");
        }

        await db
            .insert(usersToCompaniesTable)
            .values({
                companyId: Number(params.companyId),
                userId: form.data.userId,
                role: form.data.role
            });

        setFlash({ type: "success", message: "Uživatel byl úspěšně přiřazen ke společnosti" }, cookies);
        return { form };
    },

    employeeRoleForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(employeeSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        await db
            .update(usersToCompaniesTable)
            .set({
                role: form.data.role
            })
            .where(
                and(
                    eq(usersToCompaniesTable.userId, form.data.userId),
                    eq(usersToCompaniesTable.companyId, Number(params.companyId))
                )
            );


        setFlash({ type: "success", message: "Role zaměstnance byla úspěšně změněna" }, cookies);
        return { form };
    },

    employeeRfidForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(employeeRfidSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        const [rfidExistsEmployee] = await db
            .select({
                user: userTable
            })
            .from(usersToCompaniesTable)
            .leftJoin(userTable, eq(usersToCompaniesTable.userId, userTable.id))
            .where(
                and(
                    eq(usersToCompaniesTable.companyId, Number(params.companyId)),
                    eq(usersToCompaniesTable.rfidTag, form.data.rfidTag)
                )
            )

        // Check if submitted user is already asociated with company
        if (rfidExistsEmployee) {
            return message(form, `Zadané RFID je již přiřazeno k uživateli ${rfidExistsEmployee.user?.email}`);
        }

        const [rfidExists] = await db
            .select()
            .from(rfidTagTable)
            .where(
                and(
                    eq(rfidTagTable.companyId, Number(params.companyId)),
                    eq(rfidTagTable.tag, form.data.rfidTag)
                )
            );

        // Check if submitted user is already asociated with company
        if (rfidExists) {
            return message(form, `Zadané RFID je již k této společnosti přiřazeno`);
        }

        // If blank string was supplied set to null
        let rfidTag = form.data.rfidTag === "" ? null : form.data.rfidTag;

        await db
            .update(usersToCompaniesTable)
            .set({
                rfidTag: rfidTag,
                rfidValidTill: form.data.rfidValidTill
            })
            .where(
                and(
                    eq(usersToCompaniesTable.userId, form.data.userId),
                    eq(usersToCompaniesTable.companyId, Number(params.companyId))
                )
            );


        setFlash({ type: "success", message: "RFID bylo úspěšně přiřazeno k zaměstnanci" }, cookies);
        return { form };
    },

    otherRfidForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(303, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(otherRfidSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        const [rfidExistsEmployee] = await db
            .select({
                user: userTable
            })
            .from(usersToCompaniesTable)
            .leftJoin(userTable, eq(usersToCompaniesTable.userId, userTable.id))
            .where(
                and(
                    eq(usersToCompaniesTable.companyId, Number(params.companyId)),
                    eq(usersToCompaniesTable.rfidTag, form.data.rfidTag)
                )
            )

        // Check if submitted user is already asociated with company
        if (rfidExistsEmployee) {
            return message(form, `Zadané RFID je již přiřazeno k uživateli ${rfidExistsEmployee.user?.email}`);
        }

        const [rfidExists] = await db
            .select()
            .from(rfidTagTable)
            .where(
                and(
                    ne(rfidTagTable.id, Number(form.data.id)),
                    eq(rfidTagTable.companyId, Number(params.companyId)),
                    eq(rfidTagTable.tag, form.data.rfidTag)
                )
            );

        // Check if submitted user is already asociated with company
        if (rfidExists) {
            return message(form, `Zadané RFID je již k této společnosti přidáno`);
        }

        let flashMessage;
        if (form.data.id) {
            await db
                .update(rfidTagTable)
                .set({
                    tag: form.data.rfidTag,
                    description: form.data.description,
                    validTill: form.data.rfidValidTill
                })
                .where(eq(rfidTagTable.id, form.data.id));

            flashMessage = "RFID bylo úspěšně upraveno";

        } else {
            await db
                .insert(rfidTagTable)
                .values({
                    tag: form.data.rfidTag,
                    description: form.data.description,
                    validTill: form.data.rfidValidTill,
                    companyId: Number(params.companyId)
                });

            flashMessage = "RFID bylo úspěšně přidáno";
        }

        setFlash({ type: "success", message: flashMessage }, cookies);
        return { form };
    },
};