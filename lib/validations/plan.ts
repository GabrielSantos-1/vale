import { z } from 'zod'

const jsonValueSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
)

export const planSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  slug: z.string().trim().min(1, 'Slug é obrigatório'),
  downloadMbps: z.coerce.number().int().nonnegative(),
  uploadMbps: z.coerce.number().int().nonnegative(),
  latencyTarget: z.coerce.number().int().nonnegative(),
  priceCents: z.coerce.number().int().nonnegative(),
  featured: z.boolean().optional().default(false),
  benefitsJson: z.array(jsonValueSchema).optional().default([]),
  badge: z.string().trim().optional(),
})

export type PlanInput = z.infer<typeof planSchema>

export default planSchema
