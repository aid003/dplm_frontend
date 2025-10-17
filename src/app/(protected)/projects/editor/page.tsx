"use client"

import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { useProjectsStore } from "@/entities/project/model/store"
import { ProjectCard } from "@/entities/project/ui/ProjectCard"
import { useEffect } from "react"

export default function Page() {
  const projects = useProjectsStore((s) => s.projects)
  const loading = useProjectsStore((s) => s.loading)
  const error = useProjectsStore((s) => s.error)
  const fetchProjects = useProjectsStore((s) => s.fetchProjects)

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Редактор проектов</h1>
        <Button asChild>
          <Link href="/projects/new">Создать проект</Link>
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mt-4">Загрузка проектов...</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-4">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет проектов. Создайте первый.</p>
          )}
        </div>
      )}
    </div>
  )
}


