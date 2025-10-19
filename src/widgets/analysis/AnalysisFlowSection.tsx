"use client"

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { AnalysisStatusCard } from '@/entities/analysis/ui/AnalysisStatusCard'
import type { AnalysisReportDto } from '@/entities/analysis/model/types'
import type { Project } from '@/entities/project/model/types'
import { Info, Loader2 } from 'lucide-react'

interface AnalysisFlowSectionProps {
  currentReport: AnalysisReportDto | null
  selectedProject?: Project
  analysisLoading: boolean
  onCancel: () => void
  onRetry: () => void
}

export function AnalysisFlowSection({
  currentReport,
  selectedProject,
  analysisLoading,
  onCancel,
  onRetry,
}: AnalysisFlowSectionProps) {
  return (
    <>
      {currentReport && (
        <div className="mb-6">
          <AnalysisStatusCard report={currentReport} onCancel={onCancel} onRetry={onRetry} />
        </div>
      )}

      {analysisLoading && !currentReport && (
        <div className="mb-6">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Запуск анализа проекта &quot;{selectedProject?.name ?? 'Неизвестный проект'}&quot;...
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!currentReport && !analysisLoading && selectedProject && (
        <div className="mb-6">
          <Alert>
            <Info className="h-4 w-4" />
            <div>
              <AlertTitle>Анализ еще не запускался</AlertTitle>
              <AlertDescription>
                Выберите настройки анализа и нажмите &quot;Запустить анализ&quot; для начала работы
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
    </>
  )
}
