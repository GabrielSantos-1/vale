import { z } from 'zod'

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional()
})

export type FAQInput = z.infer<typeof faqSchema>

export default faqSchema

