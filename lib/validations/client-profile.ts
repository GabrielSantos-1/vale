import { z } from "zod";

export const clientProfileUpdateSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    phone: z.string().max(20).optional(),
    cpfCnpj: z.string().max(20).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.phone !== undefined ||
      data.cpfCnpj !== undefined,
    {
      message: "Informe ao menos um campo para atualizacao.",
      path: ["name"],
    }
  );

export type ClientProfileUpdateInput = z.infer<typeof clientProfileUpdateSchema>;
