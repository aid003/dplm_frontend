"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useRef, useMemo } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Progress } from "@/shared/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { FileUpload } from "@/shared/components/ui/file-upload";
import {
  projectCreateFormSchema,
  type ProjectCreateFormSchema,
} from "../model/validation";
import { useProjectCreateStore } from "@/featuries/project-create/model/store";
import type { ProjectCreateFormValues } from "../model/types";
import { useGlobalSpinnerStore } from "@/shared/store/global-spinner";

interface ProjectCreateFormProps {
  onSubmit?: (values: ProjectCreateFormValues) => Promise<void>;
}

export function ProjectCreateForm({ onSubmit }: ProjectCreateFormProps) {
  const create = useProjectCreateStore((s) => s.create);
  const creating = useProjectCreateStore((s) => s.creating);
  const progress = useProjectCreateStore((s) => s.progress);
  const status = useProjectCreateStore((s) => s.status);
  const project = useProjectCreateStore((s) => s.project);
  const error = useProjectCreateStore((s) => s.error);
  const resetStore = useProjectCreateStore((s) => s.reset);
  const showSpinner = useGlobalSpinnerStore((s) => s.show);
  const hideSpinner = useGlobalSpinnerStore((s) => s.hide);

  const form = useForm<ProjectCreateFormSchema>({
    resolver: zodResolver(projectCreateFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { handleSubmit, setValue, watch } = form;

  const selectedFileName = useMemo<string>(() => {
    const fl = watch("file") as FileList | undefined;
    const f = fl && fl.length > 0 ? fl.item(0) : null;
    return f?.name ?? "";
  }, [watch]);

  const handleFormSubmit = async (values: ProjectCreateFormSchema) => {
    const formData = new FormData();
    formData.set("name", values.name);
    if (values.description) formData.set("description", values.description);
    const file = (values.file as FileList).item(0);
    if (file) formData.set("file", file);

    if (onSubmit) {
      await onSubmit(values as ProjectCreateFormValues);
    } else {
      await create(formData);
    }
  };

  const handleFileSelect = (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    setValue("file", dt.files, { shouldValidate: true });
  };

  const handleOpenEditor = () => {
    showSpinner("Открытие редактора...");
    setTimeout(() => {
      hideSpinner();
    }, 5000);
  };

  // Тосты по изменениям состояния
  const wasCreatingRef = useRef<boolean>(false);
  const lastStatusRef = useRef<typeof status>(status);

  useEffect(() => {
    if (!wasCreatingRef.current && creating) {
      toast.message("Началась загрузка и распаковка проекта");
    }
    wasCreatingRef.current = creating;
  }, [creating]);

  useEffect(() => {
    if (lastStatusRef.current !== status) {
      if (status === "READY") {
        toast.success("Проект готов");
        // Не сбрасываем состояние здесь - оставляем кнопки видимыми
      } else if (status === "ERROR") {
        toast.error(error ?? "Ошибка при создании проекта");
      }
      lastStatusRef.current = status;
    }
  }, [status, error, resetStore]);

  // Сброс состояния при размонтировании компонента
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать проект</CardTitle>
        <CardDescription>
          Загрузите ZIP архив проекта, укажите название и описание.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Мой проект"
                      disabled={creating}
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Короткое описание"
                      disabled={creating}
                      {...field}
                    />
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
                  <FormControl>
                    <FileUpload
                      selectedFileName={selectedFileName}
                      disabled={creating}
                      onFileSelect={handleFileSelect}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0">
              <div className="flex flex-wrap items-center gap-3">
                {status !== "READY" && (
                  <Button type="submit" disabled={creating}>
                    Загрузить
                  </Button>
                )}
                {status === "READY" && project && (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/projects/editor">Перейти к проектам</Link>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleOpenEditor}
                      asChild
                    >
                      <Link href={`/editor/${project.id}`}>
                        Открыть в редакторе кода
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>

            {creating && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Загрузка и распаковка: {progress}%
                </div>
                <Progress value={progress} />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
