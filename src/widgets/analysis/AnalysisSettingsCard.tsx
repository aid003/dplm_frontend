"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { AnalysisReportDto, AnalysisType } from '@/entities/analysis/model/types'
import { Play, Settings } from 'lucide-react'

interface AnalysisSettingsCardProps {
  analysisType: AnalysisType
  onAnalysisTypeChange: (type: AnalysisType) => void
  includeTests: boolean
  onIncludeTestsChange: (value: boolean) => void
  languages: string
  onLanguagesChange: (value: string) => void
  onStart: () => void
  onReset: () => void
  analysisLoading: boolean
  selectedProjectId: string
  currentReport: AnalysisReportDto | null
}

export function AnalysisSettingsCard({
  analysisType,
  onAnalysisTypeChange,
  includeTests,
  onIncludeTestsChange,
  languages,
  onLanguagesChange,
  onStart,
  onReset,
  analysisLoading,
  selectedProjectId,
  currentReport,
}: AnalysisSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Настройки анализа
        </CardTitle>
        <CardDescription>Выберите тип анализа и дополнительные опции</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="analysisType">Тип анализа</Label>
            <select
              id="analysisType"
              value={analysisType}
              onChange={(event) => onAnalysisTypeChange(event.target.value as AnalysisType)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm mt-1"
            >
              <option value="FULL">Полный анализ</option>
              <option value="VULNERABILITY">Анализ уязвимостей</option>
              <option value="EXPLANATION">Объяснение кода</option>
              <option value="RECOMMENDATION">Рекомендации</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeTests"
            checked={includeTests}
            onChange={(event) => onIncludeTestsChange(event.target.checked)}
            className="rounded"
          />
          <Label htmlFor="includeTests">Включать тестовые файлы</Label>
        </div>

        <div>
          <Label htmlFor="languages">Языки программирования (через запятую)</Label>
          <Input
            id="languages"
            value={languages}
            onChange={(event) => onLanguagesChange(event.target.value)}
            placeholder="typescript, javascript, python"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onStart}
            disabled={analysisLoading || !selectedProjectId}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {analysisLoading ? 'Запуск...' : 'Запустить анализ'}
          </Button>

          {currentReport && (
            <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Сбросить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
