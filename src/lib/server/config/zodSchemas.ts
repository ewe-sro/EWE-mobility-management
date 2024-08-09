import { z } from 'zod';

// Validation schema for the login form
export const userSchema = z.object({
    email: z
        .string()
        .email({ message: "Zadejte prosím platný email" })
        .trim()
        .toLowerCase()
        .min(1, { message: "E-mail je povinná hodnota" }),
    password: z
        .string()
        .trim()
        .min(1, { message: "Heslo je povinná hodnota" }),
    confirmPassword: z
        .string()
        .trim()
        .min(1, { message: "Zadejte znovu heslo" }),
    firstName: z
        .string()
        .max(50, { message: "Křestní jméno může mít maximálně 50 znaků" })
        .trim()
        .nullish(),
    lastName: z
        .string()
        .max(50, { message: "Příjmení může mít maximálně 50 znaků" })
        .trim()
        .nullish()
});

export const registerSchema = z.object({
    email: z
        .string()
        .email({ message: "Zadejte prosím platný email" })
        .trim()
        .toLowerCase(),
    firstName: z
        .string()
        .max(50, { message: "Křestní jméno může mít maximálně 50 znaků" })
        .trim()
        .nullish(),
    lastName: z
        .string()
        .max(50, { message: "Příjmení může mít maximálně 50 znaků" })
        .trim()
        .nullish(),
    role: z
        .string()
        .trim()
        .nullish(),
    password: z.string()
        .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
            message: "Heslo musí mít alespoň 8 znaků a musí obsahovat malé písmeno, velké písmeno a číslo",
        }),
    confirmPassword: z.string(),
    companyId: z
        .number()
        .nullish(),
});

export const chargerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Jméno nabíjecí stanice nemůže být prázdné" }),
    description: z
        .string()
        .trim()
        .nullish(),
    companyId: z
        .number()
        .nullish(),
    userId: z
        .string()
        .nullish()
});

export const controllerSchema = z.object({
    chargingPointName: z
        .string()
        .trim()
        .nullish()
});

export const companySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Jméno společnosti nemůže být prázdné" }),
    ic: z
        .string()
        .length(8, { message: "IČO musí mít 8 znaků" }),
    dic: z
        .string()
        .trim()
        .nullish(),
    city: z
        .string()
        .trim()
        .nullish(),
    street: z
        .string()
        .trim()
        .nullish(),
    zip: z
        .string()
        .trim()
        .nullish(),
    logo: z
        .custom<File>()
        .refine((file) => file?.size <= 200000, "Maximální velikost loga je 2 MB")
        .refine((file) => !file || (!!file && file.type?.startsWith("image")), {
            message: "Pouze obrázkové formáty jsou povoleny"
        })
        .nullish()
});

export const employeeSchema = z.object({
    userId: z
        .string()
        .min(1, { message: "Vyberte registrovaného uživatele" }),
    role: z
        .string()
        .min(1, { message: "Vyberte roli zaměstnance" })
});

export const employeeRfidSchema = z.object({
    rfidTag: z
        .string()
        .trim(),
    rfidValidTill: z
        .date()
        .nullish(),
    userId: z
        .string(),
});

export const otherRfidSchema = z.object({
    id: z
        .number()
        .nullish(),
    rfidTag: z
        .string()
        .trim()
        .min(1, { message: "RFID nemůže být prázdné" }),
    rfidValidTill: z
        .date()
        .nullish(),
    description: z
        .string()
        .nullish()
});