import { z } from 'zod';

// Validation schema for the login form
export const userSchema = z.object({
    email: z
        .string({ required_error: "E-mail je povinná hodnota" })
        .email({ message: "Zadejte prosím platný email" })
        .trim()
        .toLowerCase(),
    password: z
        .string({ required_error: "Heslo je povinná hodnota" })
        .trim()
});