import { z } from 'zod'

const coverageCheckSchema = z.object({
  cep: z.string().trim().optional(),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
})

export default coverageCheckSchema