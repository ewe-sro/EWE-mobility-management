import { WEBSITE_URL } from "$env/static/private";

import { fail, error } from "@sveltejs/kit";
import { redirect, setFlash } from 'sveltekit-flash-message/server'

import { generateId } from "lucia";
import { TimeSpan, createDate } from "oslo";

import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from "$lib/server/config/zodSchemas";

import { eq, isNull } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable, profileTable, registerInvitationTable, companyTable, usersToCompaniesTable } from "$lib/server/db/schema";

import { render } from "@react-email/render";
import { sendEmail } from "$lib/server/email/sendEmail";
import { RegisterEmail } from "$lib/emails/register-email";

const userAccountSchema = registerSchema.pick({
    email: true,
    firstName: true,
    lastName: true,
    companyId: true,
    role: true
}).refine((data) => (!data.companyId && !data.role) || (data.companyId && data.role), {
    message: "Vyberte roli zaměstnance",
    path: ["role"],
});

export const load = (async ({ locals }) => {
    if (!locals.user) {
        redirect(401, "/login");
    }

    if (locals.user.role !== "ADMIN") {
        error(404, {
            message: "Nenalezeno"
        });
    }

    const form = await superValidate(zod(userAccountSchema));

    const companies = await db
        .select({
            company: companyTable
        })
        .from(companyTable);

    const users = await db
        .select({
            user: userTable,
            profile: profileTable,
            companyName: companyTable.name
        })
        .from(userTable)
        .leftJoin(profileTable, eq(userTable.id, profileTable.userId))
        .leftJoin(usersToCompaniesTable, eq(userTable.id, usersToCompaniesTable.userId))
        .leftJoin(companyTable, eq(usersToCompaniesTable.companyId, companyTable.id));

    const invitedUsers = await db
        .select({
            user: registerInvitationTable,
            companyName: companyTable.name
        })
        .from(registerInvitationTable)
        .leftJoin(companyTable, eq(registerInvitationTable.companyId, companyTable.id))
        .where(isNull(registerInvitationTable.userId));

    return {
        user: locals.user,
        form: form,
        companies: companies,
        users: users,
        invitedUsers: invitedUsers
    }
});

export const actions = {
    inviteUserForm: async ({ request, cookies, locals }) => {
        if (!locals.user) {
            redirect(401, "/login", { type: "error", message: "Pro přístup k této stránce se musíte přihlásit" }, cookies);
        }

        // get form data and validate them
        const form = await superValidate(request, zod(userAccountSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // Check if user with submitted e-mail is already registered
        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, form.data.email));

        const userExists = user.length > 0;

        if (userExists) {
            return message(form, "Uživatel s tímto e-mailem je již zaregistrován");
        }

        // Delete all previous register invite records
        await db
            .delete(registerInvitationTable)
            .where(eq(registerInvitationTable.email, form.data.email));

        // Generate the register token
        const tokenId = generateId(40);

        await db
            .insert(registerInvitationTable)
            .values({
                id: tokenId,
                email: form.data.email,
                expiresAt: createDate(new TimeSpan(14, "d")),
                firstName: form.data.firstName,
                lastName: form.data.lastName,
                companyId: form.data.companyId
            });

        const verificationLink = `${WEBSITE_URL}/verify/${tokenId}`;

        // Render component to HTML email
        const emailHtml = render(RegisterEmail({
            verificationLink: verificationLink
        }), {
            pretty: true
        });

        // Render component to plain text
        const plainText = render(RegisterEmail({
            verificationLink: verificationLink
        }), {
            plainText: true
        });

        // Email options
        const options = {
            to: form.data.email,
            subject: "[EMM] Dokončení registrace",
            html: emailHtml,
            plainText: plainText
        }

        // Send email with register link
        const response = await sendEmail(options);

        if (!response.ok) {
            setFlash({ type: 'error', message: "Email se nepodařilo odeslat" }, cookies);

            error(500);
        }

        setFlash({ type: "success", message: "Uživateli byla zaslána pozvánka k registraci na e-mail" }, cookies);
        return { form };
    },
};