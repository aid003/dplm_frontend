"use client"

import Link from "next/link"
import type { Project } from "@/entities/project/model/types"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Trash2 } from "lucide-react"
import { useProjectsStore } from "@/entities/project/model/store"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { toast } from "sonner"
import { useGlobalSpinnerStore } from "@/shared/store/global-spinner"

type ProjectCardProps = {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const created = new Date(project.createdAt)
  const createdFmt = isNaN(created.getTime()) ? "" : created.toLocaleString()
  const deleteProject = useProjectsStore((s) => s.deleteProjectById)
  const showSpinner = useGlobalSpinnerStore((s) => s.show)
  const hideSpinner = useGlobalSpinnerStore((s) => s.hide)

  // Обработка description как объекта
  const getDescriptionText = () => {
    if (typeof project.description === 'string') {
      return project.description
    }
    if (typeof project.description === 'object' && project.description !== null) {
      // Попробуем извлечь текст из объекта
      const obj = project.description as Record<string, unknown>
      if ('text' in obj && typeof obj.text === 'string') {
        return obj.text
      }
      if ('content' in obj && typeof obj.content === 'string') {
        return obj.content
      }
      if ('description' in obj && typeof obj.description === 'string') {
        return obj.description
      }
    }
    return null
  }

  const descriptionText = getDescriptionText()

  const handleOpenEditor = () => {
    showSpinner("Открытие редактора...")
    // Скрываем спиннер через небольшую задержку, чтобы пользователь увидел его
    setTimeout(() => {
      hideSpinner()
    }, 1000)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 break-words">
            {project.name}
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="whitespace-nowrap ml-4"
            onClick={handleOpenEditor}
            asChild
          >
            <Link href={`/editor/${project.id}`}>Открыть в редакторе</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {/* Описание и кнопка удаления */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {descriptionText && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {descriptionText}
                </p>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Удалить проект"
                  className="ml-4"
                  onClick={async () => {
                    const confirmed = window.confirm("Удалить проект? Это действие необратимо.")
                    if (!confirmed) return
                    const tId = toast.loading("Удаление проекта...")
                    try {
                      await deleteProject(project.id)
                      toast.success("Проект удалён", { id: tId })
                    } catch (e) {
                      const message = e instanceof Error ? e.message : "Не удалось удалить проект"
                      toast.error(message, { id: tId })
                    }
                  }}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Удалить</TooltipContent>
            </Tooltip>
          </div>

          {/* Статус и дата создания */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="uppercase tracking-wide font-medium">
              Статус: {project.status}
            </span>
            {createdFmt && (
              <span>Дата создания: {createdFmt}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


