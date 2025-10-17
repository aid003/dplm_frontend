"use client"

import Link from "next/link"
import type { Project } from "@/entities/project/model/types"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Trash2 } from "lucide-react"
import { useProjectsStore } from "@/entities/project/model/store"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { toast } from "sonner"

type ProjectCardProps = {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const created = new Date(project.createdAt)
  const createdFmt = isNaN(created.getTime()) ? "" : created.toLocaleString()
  const deleteProject = useProjectsStore((s) => s.deleteProjectById)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="line-clamp-2 break-words">{project.name}</CardTitle>
        <CardDescription>
          <span className="text-xs uppercase tracking-wide truncate">{project.status}</span>
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Удалить проект"
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
          <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
            <Link href={`/editor/${project.id}`}>Открыть в редакторе</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {typeof project.description === 'string' ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        ) : null}
        {createdFmt && (
          <p className="text-xs text-muted-foreground mt-3">Создан: {createdFmt}</p>
        )}
      </CardContent>
    </Card>
  )
}


