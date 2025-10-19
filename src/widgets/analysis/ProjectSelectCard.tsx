"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { Project } from '@/entities/project/model/types'
import { Folder } from 'lucide-react'

interface ProjectSelectCardProps {
  projects: Project[]
  loading: boolean
  selectedProjectId: string
  onSelect: (projectId: string) => void
  selectedProject?: Project
}

export function ProjectSelectCard({
  projects,
  loading,
  selectedProjectId,
  onSelect,
  selectedProject,
}: ProjectSelectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Выбор проекта
        </CardTitle>
        <CardDescription>Выберите проект для анализа кода</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка проектов...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">У вас пока нет проектов</p>
            <Button asChild>
              <a href="/projects/new">Создать первый проект</a>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <select
              value={selectedProjectId}
              onChange={(event) => onSelect(event.target.value)}
              className="w-[300px] px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>

            {selectedProject && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Статус:{' '}
                  <Badge variant={selectedProject.status === 'READY' ? 'default' : 'secondary'}>
                    {selectedProject.status}
                  </Badge>
                </p>
                <p>Создан: {new Date(selectedProject.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
