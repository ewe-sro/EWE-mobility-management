import { WEBSITE_URL } from "$env/static/private";

import { fail } from "@sveltejs/kit";

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from "$lib/server/config/zodSchemas.js";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";

import { createPasswordResetToken } from "$lib/server/auth/utils";

import { render } from "@react-email/render";
import { sendEmail } from "$lib/server/email/sendEmail";
import { ResetEmail } from "$lib/emails/reset-email";


const resetSchema = userSchema.pick({
    email: true
});

export const load = (async () => {
    const form = await superValidate(zod(resetSchema));

    return { form };
});

export const actions = {
    default: async ({ request }) => {
        // get form data and validate them
        const form = await superValidate(request, zod(resetSchema));

        // If the submitted form is invalid
        if (!form.valid) {
            return fail(400, { form });
        }

        // Select user with the submitted email
        const [existingUser] = await db
            .select({
                id: userTable.id
            })
            .from(userTable)
            .where(eq(userTable.email, form.data.email));

        // If the submitted email wasn't found in the database
        if (!existingUser) {
            return { form };
        }

        // Create password reset token and URL for the submitted email
        const verificationToken = await createPasswordResetToken(existingUser.id);
        const verificationLink = `${WEBSITE_URL}/reset/${verificationToken}`;

        // Render component to HTML email
        const emailHtml = render(ResetEmail({
            email: form.data.email,
            verificationLink: verificationLink
        }), {
            pretty: true
        });

        // Render component to plain text
        const plainText = render(ResetEmail({
            email: form.data.email,
            verificationLink: verificationLink
        }), {
            plainText: true
        });


        // Email options
        const options = {
            to: form.data.email,
            subject: "[EEM] Obnova hesla",
            html: emailHtml,
            plainText: plainText
        }

        // Send email with password reset link
        sendEmail(options);
        return { form };
    },
};