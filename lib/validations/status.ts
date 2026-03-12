import { z } from 'zod'

export const statusSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  status: z.string().min(1),
  description: z.string().optional(),
  startedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
  isVisible: z.boolean().optional()
})

export type StatusInput = z.infer<typeof statusSchema>

export default statusSchema

