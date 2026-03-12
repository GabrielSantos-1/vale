import { z } from 'zod'

export const coverageSchema = z.object({
  cep: z.string().min(2).optional(),
  city: z.string().optional(),
  district: z.string().optional()
})

export type CoverageInput = z.infer<typeof coverageSchema>

export default coverageSchema

