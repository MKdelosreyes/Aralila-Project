import { z } from "zod";

export const stepOneSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

export const stepTwoSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("student"),
    firstName: z.string(),
    lastName: z.string(),
  }),
  z.object({
    role: z.literal("teacher"),
    firstName: z.string(),
    lastName: z.string(),
    university: z.string(),
  }),
]);

export type StepOneValues = z.infer<typeof stepOneSchema>;
export type StepTwoValues = z.infer<typeof stepTwoSchema>;
