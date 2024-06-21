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
        .nullish(),
    userId: z
        .string()
        .min(1, { message: "Vyberte registrovaného uživatele" })
});

export const registerSchema = z.object({
    email: z
        .string()
        .email({ message: "Zadejte prosím platný email" })
        .trim()
        .toLowerCase()
        .min(1, { message: "E-mail je povinná hodnota" }),
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
        .min(1, { message: "Zadejte jméno nabíjecí stanice" }),
    description: z
        .string()
        .trim()
        .nullish(),
    ipAddress: z
        .string()
        .ip({ version: 'v4', message: "Zadejte platnou IP adresu" }),
    mqttPort: z
        .number()
        .min(1, { message: "MQTT port musí být mezi 1-65535" })
        .max(65535, { message: "MQTT port musí být mezi 1-65535" })
        .default(1883),
    mqttUser: z
        .string()
        .trim()
        .nullish(),
    mqttPassword: z
        .string()
        .trim()
        .nullish(),
    restApiPort: z
        .number()
        .min(1, { message: "REST API port musí být mezi 1-65535" })
        .max(65535, { message: "REST API port musí být mezi 1-65535" })
        .default(5555),
    companyId: z
        .number()
        .nullish(),
    userId: z
        .number()
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
        .min(1, { message: "Zadejte jméno společnosti nebo jméno a příjmení" }),
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

export const rfidSchema = z.object({
    rfidTag: z
        .string()
        .trim()
        .min(1, { message: "Zadejte RFID" }),
    rfidValidTill: z
        .date()
        .nullish(),
    userId: z
        .string()
});