import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  cep: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional()
})

export type LeadInput = z.infer<typeof leadSchema>

export default leadSchema

