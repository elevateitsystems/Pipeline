import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  passCode: z.string().min(4, "Passcode must be at least 4 characters long").optional(),
  pin: z.string().min(4, "PIN must be at least 4 characters long").max(8, "PIN must be at most 8 characters long").optional(),
}).refine((data) => data.passCode || data.pin, {
  message: "Either passCode or pin must be provided",
});

export type LoginData = z.infer<typeof LoginSchema>;