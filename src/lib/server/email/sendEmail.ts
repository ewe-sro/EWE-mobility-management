import { json, error } from "@sveltejs/kit";

import nodemailer from "nodemailer";

import {
    EMAIL_FROM_ADDRESS,
    EMAIL_SMTP_HOST,
    EMAIL_FROM_NAME,
    EMAIL_SMTP_PASSWORD,
    EMAIL_SMTP_PORT,
    EMAIL_SMTP_USER
} from "$env/static/private";

export async function sendEmail(options: any) {
    let secure;

    if (Number(EMAIL_SMTP_PORT) == 465) {
        secure = true;
    } else {
        secure = false;
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_SMTP_HOST,
        port: Number(EMAIL_SMTP_PORT),
        secure: secure, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: EMAIL_SMTP_USER,
            pass: EMAIL_SMTP_PASSWORD,
        },
    });

    // If no email options were provided throw an error
    if (!options) {
        throw new Error("You need to provide email options.")
    }

    // If no FROM email address was provided opt to default (.env value)
    if (!options["from"]) {
        options["from"] = EMAIL_FROM_ADDRESS
    }

    try {
        transporter.sendMail(options);
    } catch (error) {
        console.error(`Error sending email: ${JSON.stringify(error)}`);
    }

    return json({ success: true });
}