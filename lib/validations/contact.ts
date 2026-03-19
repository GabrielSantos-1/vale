import { z } from 'zod'

export const contactSchema = z.object({
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
    .max(30, 'Telefone deve ter no máximo 30 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),

  subject: z
    .string()
    .trim()
    .max(150, 'Assunto deve ter no máximo 150 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),

  message: z
    .string()
    .trim()
    .min(5, 'Mensagem deve ter pelo menos 5 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres'),
})

export type ContactInput = z.infer<typeof contactSchema>

export default contactSchema