import { z } from 'zod'

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  email: z
    .string()
    .trim()
    .email('E-mail inválido'),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),

  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),

  district: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),

  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v.replace(/\D/g, '') : undefined)),

  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),

  source: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),

  status: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default('new')
})

export type LeadInput = z.infer<typeof leadSchema>

export default leadSchema
