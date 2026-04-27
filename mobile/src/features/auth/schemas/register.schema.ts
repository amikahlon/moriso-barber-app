import { z } from "zod";

const isValidBirthDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  );
};

export const registerSchema = z.object({
  fullName: z.string().min(2, "יש להזין שם מלא"),

  phone: z
    .string()
    .refine((value) => value.replace(/\D/g, "").length >= 9, "מספר טלפון לא תקין"),

  email: z.string().email("אימייל לא תקין"),

  password: z.string().min(8, "לפחות 8 תווים"),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לידה לא תקין")
    .refine(isValidBirthDate, "תאריך לידה לא תקין"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
