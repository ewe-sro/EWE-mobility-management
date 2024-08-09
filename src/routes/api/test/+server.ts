import { error, json } from '@sveltejs/kit';

export const GET = async () => {
    return json({ success: true });
}