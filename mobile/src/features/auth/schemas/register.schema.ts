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

const optionalPhoneSchema = z.string().refine((value) => {
  if (!value.trim()) {
    return true;
  }

  const phone = value.replace(/\D/g, "");
  return phone.length >= 9;
}, "מספר טלפון לא תקין");

const optionalBirthDateSchema = z.string().refine((value) => {
  const birthDate = value.trim();

  return (
    birthDate.length === 0 ||
    (/^\d{4}-\d{2}-\d{2}$/.test(birthDate) && isValidBirthDate(birthDate))
  );
}, "תאריך לידה לא תקין");

export const registerSchema = z.object({
  fullName: z.string().min(2, "יש להזין שם מלא"),

  phone: optionalPhoneSchema,

  email: z.string().email("אימייל לא תקין"),

  password: z.string().min(8, "לפחות 8 תווים"),

  birthDate: optionalBirthDateSchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;
