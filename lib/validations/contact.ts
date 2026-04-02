import { z } from 'zod';

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),

    email: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value;
        return value.trim().toLowerCase();
      },
      z
        .string()
        .email('E-mail inválido')
        .max(160, 'E-mail deve ter no máximo 160 caracteres'),
    ),

    phone: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value;
        const normalized = value.trim();
        return normalized === '' ? undefined : normalized;
      },
      z
        .string()
        .max(30, 'Telefone deve ter no máximo 30 caracteres')
        .refine((value) => {
          const digits = value.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 11;
        }, 'Telefone inválido')
        .optional(),
    ),

    subject: z.preprocess((value) => {
      if (typeof value !== 'string') return value;
      const normalized = value.trim();
      return normalized === '' ? undefined : normalized;
    }, z.string().max(150, 'Assunto deve ter no máximo 150 caracteres').optional()),

    message: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value;
        return value.trim();
      },
      z
        .string()
        .min(5, 'Mensagem deve ter pelo menos 5 caracteres')
        .max(2000, 'Mensagem deve ter no máximo 2000 caracteres'),
    ),

    website: z.preprocess((value) => {
      if (typeof value !== 'string') return value;
      const normalized = value.trim();
      return normalized === '' ? undefined : normalized;
    }, z.string().max(255).optional()),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;

export default contactSchema;

