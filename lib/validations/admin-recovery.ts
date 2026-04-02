import { z } from 'zod';

export const adminRecoveryRequestSchema = z
  .object({
    email: z.preprocess(
      (value) => (typeof value === 'string' ? value.trim() : value),
      z
        .string()
        .email('E-mail inválido.')
        .max(160, 'E-mail deve ter no máximo 160 caracteres.'),
    ),
  })
  .strict();

export const adminRecoveryResetSchema = z
  .object({
    token: z
      .string()
      .min(40, 'Token inválido.')
      .max(256, 'Token inválido.')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Token inválido.'),
    newPassword: z
      .string()
      .min(12, 'A senha deve ter no mínimo 12 caracteres.')
      .max(128, 'A senha deve ter no máximo 128 caracteres.')
      .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula.')
      .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula.')
      .regex(/[0-9]/, 'A senha deve conter ao menos um número.')
      .regex(
        /[^A-Za-z0-9]/,
        'A senha deve conter ao menos um caractere especial.',
      ),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'A confirmação de senha não confere.',
  });

export type AdminRecoveryRequestInput = z.infer<
  typeof adminRecoveryRequestSchema
>;
export type AdminRecoveryResetInput = z.infer<typeof adminRecoveryResetSchema>;

