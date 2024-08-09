
import { redirect } from 'sveltekit-flash-message/server'

export const load = async () => {
    redirect(302, "/login");
};