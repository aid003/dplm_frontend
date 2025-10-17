"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { useProjectCreateStore } from "@/featuries/project-create/model/store"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  file: z
    .any()
    .refine((files) => files instanceof FileList && files.length > 0, "Выберите ZIP файл"),
})

type FormValues = z.infer<typeof formSchema>

export default function Page() {
  const create = useProjectCreateStore((s) => s.create)
  const creating = useProjectCreateStore((s) => s.creating)
  const progress = useProjectCreateStore((s) => s.progress)
  const status = useProjectCreateStore((s) => s.status)
  const project = useProjectCreateStore((s) => s.project)
  const error = useProjectCreateStore((s) => s.error)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData()
    formData.set("name", values.name)
    if (values.description) formData.set("description", values.description)
    const file = (values.file as FileList).item(0)
    if (file) formData.set("file", file)

    await create(formData)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Проект создан, идёт распаковка")
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Создать проект</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-xl space-y-5">
        <div className="space-y-2">
          <label className="text-sm" htmlFor="name">Название</label>
          <Input id="name" placeholder="Мой проект" disabled={creating} {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm" htmlFor="description">Описание</label>
          <Input id="description" placeholder="Короткое описание" disabled={creating} {...register("description")} />
        </div>

        <div className="space-y-2">
          <label className="text-sm" htmlFor="file">ZIP архив</label>
          <Input id="file" type="file" accept=".zip" disabled={creating} {...register("file")} />
          {errors.file && <p className="text-xs text-red-500">{errors.file.message as string}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={creating}>Загрузить</Button>
          {status === 'READY' && project && (
            <>
              <Button asChild variant="outline">
                <Link href="/projects/editor">Перейти к проектам</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/editor/${project.id}`}>Открыть в редакторе кода</Link>
              </Button>
            </>
          )}
        </div>

        {creating && (
          <>
            <Separator className="my-1" />
            <div className="text-sm text-muted-foreground">Загрузка и распаковка: {progress}%</div>
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </form>
    </div>
  )
}


