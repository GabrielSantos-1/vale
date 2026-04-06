import { z } from 'zod';

function normalizeCep(value: string) {
  return value.replace(/\D/g, '');
}

export const coverageSchema = z
  .object({
    city: z
      .string()
      .trim()
      .min(1, 'Cidade é obrigatória')
      .max(120, 'Cidade muito longa'),

    district: z
      .string()
      .trim()
      .min(1, 'Bairro é obrigatório')
      .max(120, 'Bairro muito longo'),

    cepStart: z
      .string()
      .trim()
      .transform(normalizeCep)
      .refine((val) => /^\d{8}$/.test(val), {
        message: 'CEP inicial deve ter 8 dígitos',
      }),

    cepEnd: z
      .string()
      .trim()
      .transform(normalizeCep)
      .refine((val) => /^\d{8}$/.test(val), {
        message: 'CEP final deve ter 8 dígitos',
      }),

    isAvailable: z.boolean().optional().default(false),

    notes: z.string().trim().max(1000, 'Observações muito longas').optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.cepStart > data.cepEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cepStart'],
        message: 'CEP inicial não pode ser maior que o CEP final',
      });
    }
  });

export type CoverageInput = z.infer<typeof coverageSchema>;

export default coverageSchema;
