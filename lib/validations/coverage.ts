import { z } from 'zod'

export const coverageSchema = z.object({
  city: z.string().trim().min(1, 'Cidade é obrigatória'),
  district: z.string().trim().min(1, 'Bairro é obrigatório'),
  cepStart: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'CEP inicial deve ter 8 dígitos'),
  cepEnd: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'CEP final deve ter 8 dígitos'),
  isAvailable: z.boolean().optional().default(false),
  notes: z.string().trim().optional(),
})

export type CoverageInput = z.infer<typeof coverageSchema>

export default coverageSchema