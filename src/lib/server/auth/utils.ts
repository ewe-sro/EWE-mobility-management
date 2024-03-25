import type { Cookies } from '@sveltejs/kit';
import type { Lucia } from 'lucia';

import { TimeSpan, createDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { generateId } from "lucia";

import { eq } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { passwordResetTable } from "$lib/server/db/schema";

export const createAndSetSession = async (lucia: Lucia, userId: string, cookies: Cookies) => {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes
    });
};

export const deleteSessionCookie = async (lucia: Lucia, cookies: Cookies) => {
    const sessionCookie = lucia.createBlankSessionCookie();

    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes
    });
};

async function createPasswordResetToken(userId: string): Promise<string> {
    // invalidate all existing tokens
    await db.delete(passwordResetTable).where(eq(passwordResetTable.userId, userId));

    // Generate and hash the token
    const tokenId = generateId(40);
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));

    // Add the generated token to database
    await db.insert(passwordResetTable).values({
        tokenHash: tokenHash,
        userId: userId,
        expiresAt: createDate(new TimeSpan(2, "h"))
    });

    return tokenId;
}