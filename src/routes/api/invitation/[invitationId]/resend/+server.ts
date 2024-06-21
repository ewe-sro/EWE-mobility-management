import { WEBSITE_URL } from "$env/static/private";

import { error, json } from '@sveltejs/kit';

import { setFlash } from 'sveltekit-flash-message/server';

import { TimeSpan, createDate } from "oslo";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { registerInvitationTable } from "$lib/server/db/schema";

import { render } from "@react-email/render";
import { sendEmail } from "$lib/server/email/sendEmail";
import { RegisterEmail } from "$lib/emails/register-email";

export const POST = async ({ locals, params, cookies }) => {
    // get the current login session
    const user = locals.user;

    // if user is empty throw an error
    if (!user) error(401, { message: "User not logged in" });

    // if user is not admin throw an error
    if (user.role !== "ADMIN") error(403, { message: "Your user account does not have the proper permissions" })

    // Get the data of invited user
    const [invitedUser] = await db
        .select()
        .from(registerInvitationTable)
        .where(eq(registerInvitationTable.id, params.invitationId));

    // Extend the expiry date of register invitation
    await db
        .update(registerInvitationTable)
        .set({
            expiresAt: createDate(new TimeSpan(14, "d")),
        })
        .where(eq(registerInvitationTable.id, params.invitationId));

    const verificationLink = `${WEBSITE_URL}/verify/${invitedUser.id}`;

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
        to: invitedUser.email,
        subject: "[EEM] Dokončení registrace",
        html: emailHtml,
        plainText: plainText
    }

    // Send email with register link
    const response = await sendEmail(options);

    if (!response.ok) {
        setFlash({ type: 'error', message: "Email se nepodařilo odeslat" }, cookies);

        error(500);
    }

    setFlash({ type: 'success', message: "Uživateli byla zaslána pozvánka k registraci na email" }, cookies);

    return json({ success: true });
}