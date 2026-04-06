import { z } from "zod";

export const clientChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(255),
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas nao coincidem.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"],
  });

export const clientRecoveryRequestSchema = z
  .object({
    email: z.string().email().max(160),
  })
  .strict();

export const clientRecoveryResetSchema = z
  .object({
    token: z.string().min(20).max(500),
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas nao coincidem.",
    path: ["confirmPassword"],
  });

export type ClientChangePasswordInput = z.infer<typeof clientChangePasswordSchema>;
export type ClientRecoveryRequestInput = z.infer<typeof clientRecoveryRequestSchema>;
export type ClientRecoveryResetInput = z.infer<typeof clientRecoveryResetSchema>;
