import { fail } from "@sveltejs/kit";
import { redirect, setFlash } from 'sveltekit-flash-message/server';

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { companySchema, userSchema, chargerSchema, rfidSchema } from "$lib/server/config/zodSchemas";

import { eq, count, sum, avg, and, desc } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { companyTable, usersToCompaniesTable, chargerTable, chargingControllerTable, lastKnownStateTable, chargingSessionTable, userTable, profileTable } from "$lib/server/db/schema";

const companyEditSchema = companySchema.omit({
    logo: true,
});

const employeeSchema = userSchema.pick({
    userId: true
});

export const load = async ({ locals, params, cookies }) => {
    const user = locals.user;

    if (!user) redirect(303, "/login");

    // Get the company record from database
    const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.id, Number(params.companyId)));

    // Create a forms
    const companyForm = await superValidate(company, zod(companyEditSchema));
    const employeeForm = await superValidate(zod(employeeSchema));
    const chargerForm = await superValidate(zod(chargerSchema));
    const rfidForm = await superValidate(zod(rfidSchema));

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
            availableCount: count(lastKnownStateTable.id)
        })
        .from(lastKnownStateTable)
        .leftJoin(chargingControllerTable, eq(lastKnownStateTable.controllerId, chargingControllerTable.id))
        .leftJoin(chargerTable, eq(chargingControllerTable.chargerId, chargerTable.id))
        .where(
            and(
                eq(chargerTable.companyId, company.id),
                eq(lastKnownStateTable.state, "disconnected")
            ));

    // Get last 10 charging sessions
    const chargingSessions = await db
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
        .limit(10);

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


    return {
        user: user,
        users: users,
        company: company,
        companies: companies,
        employees: employees,
        chargers: chargers,
        chargerCount: chargerCount.chargerCount,
        controllerCount: controllerCount.controllerCount,
        availableCount: availableCount.availableCount,
        chargingSessions: chargingSessions,
        chargingStats: chargingStats,
        companyForm: companyForm,
        employeeForm: employeeForm,
        chargerForm: chargerForm,
        rfidForm: rfidForm
    };
}

export const actions = {
    companyForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
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

    employeeForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
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
                userId: form.data.userId
            });

        setFlash({ type: "success", message: "Uživatel byl úspěšně přiřazen ke společnosti" }, cookies);
        return { form };
    },

    rfidForm: async ({ request, locals, params, cookies }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(rfidSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        const [rfidExists] = await db
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
        if (rfidExists) {
            return message(form, `Zadané RFID je již přiřazeno k uživateli ${rfidExists.user?.email}`);
        }

        console.log(form.data);

        await db
            .update(usersToCompaniesTable)
            .set({
                rfidTag: form.data.rfidTag,
                rfidValidTill: form.data.rfidValidTill
            })
            .where(eq(usersToCompaniesTable.userId, form.data.userId));


        setFlash({ type: "success", message: "RFID bylo úspěšně přiřazeno k zaměstnanci" }, cookies);
        return { form };
    }
};