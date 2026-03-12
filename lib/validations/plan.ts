import { z } from 'zod'

export const planSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  downloadMbps: z.number().int().nonnegative(),
  uploadMbps: z.number().int().nonnegative(),
  latencyTarget: z.number().int().optional(),
  priceCents: z.number().int().nonnegative(),
  featured: z.boolean().optional(),
  benefitsJson: z.string().optional(),
  badge: z.string().optional()
})

export type PlanInput = z.infer<typeof planSchema>

export default planSchema

