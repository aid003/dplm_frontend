import { z } from "zod"

export const projectCreateFormSchema = z.object({
  name: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  file: z
    .any()
    .refine((files) => files instanceof FileList && files.length > 0, "Выберите ZIP файл"),
})

export type ProjectCreateFormSchema = z.infer<typeof projectCreateFormSchema>
