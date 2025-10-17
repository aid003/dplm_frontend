"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Progress } from "@/shared/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { useProjectCreateStore } from "@/featuries/project-create/model/store"

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      // file по умолчанию не задаём (оставляем undefined)
    },
  })
  const { handleSubmit, reset, setValue, watch } = form

  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedFileName = useMemo<string>(() => {
    const fl = watch("file") as FileList | undefined
    const f = fl && fl.length > 0 ? fl.item(0) : null
    return f?.name ?? ""
  }, [watch])

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData()
    formData.set("name", values.name)
    if (values.description) formData.set("description", values.description)
    const file = (values.file as FileList).item(0)
    if (file) formData.set("file", file)
    await create(formData)
  }

  const assignFile = (file: File) => {
    if (fileInputRef.current) {
      const dt = new DataTransfer()
      dt.items.add(file)
      fileInputRef.current.files = dt.files
    }
    const dt = new DataTransfer()
    dt.items.add(file)
    setValue("file", dt.files, { shouldValidate: true })
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.item(0)
    if (file) assignFile(file)
  }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  // Тосты по изменениям состояния
  const wasCreatingRef = useRef<boolean>(false)
  const lastStatusRef = useRef<typeof status>(status)

  useEffect(() => {
    if (!wasCreatingRef.current && creating) {
      toast.message("Началась загрузка и распаковка проекта")
    }
    wasCreatingRef.current = creating
  }, [creating])

  useEffect(() => {
    if (lastStatusRef.current !== status) {
      if (status === 'READY') {
        toast.success("Проект готов")
        reset()
      } else if (status === 'ERROR') {
        toast.error(error ?? 'Ошибка при создании проекта')
      }
      lastStatusRef.current = status
    }
  }, [status, error, reset])

  return (
    <div className="p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Создать проект</CardTitle>
          <CardDescription>Загрузите ZIP архив проекта, укажите название и описание.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Мой проект" disabled={creating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Короткое описание" disabled={creating} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="file"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>ZIP архив</FormLabel>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-dashed rounded-md p-6 transition-colors cursor-pointer flex items-center gap-3 ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent/40'
                      } border`}
                    >
                      <UploadCloud />
                      <div className="flex-1">
                        <div className="text-sm">Перетащите ZIP сюда или нажмите для выбора</div>
                        <div className="text-xs text-muted-foreground mt-1">Допускается только .zip</div>
                        {selectedFileName && (
                          <div className="text-xs mt-2">Выбрано: <span className="font-medium">{selectedFileName}</span></div>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".zip"
                        disabled={creating}
                        onChange={(e) => {
                          const f = e.target.files?.item(0)
                          if (f) assignFile(f)
                        }}
                        className="sr-only"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0">
                <div className="flex flex-wrap items-center gap-3">
                  {status !== 'READY' && (
                    <Button type="submit" disabled={creating}>Загрузить</Button>
                  )}
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
              </CardFooter>

              {creating && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Загрузка и распаковка: {progress}%</div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


