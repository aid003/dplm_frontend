"use client"

import Link from "next/link"
import type { Project } from "@/entities/project/model/types"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const created = new Date(project.createdAt)
  const createdFmt = isNaN(created.getTime()) ? "" : created.toLocaleString()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>
          <span className="text-xs uppercase tracking-wide">{project.status}</span>
        </CardDescription>
        <CardAction>
          <Button asChild size="sm" variant="outline">
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


