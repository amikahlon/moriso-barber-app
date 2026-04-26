import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "יש למלא אימייל")
    .email("אימייל לא תקין"),
  password: z.string().min(1, "יש למלא סיסמה"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
