"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import type {
  AnalysisReportDto,
  CodeExplanationDto,
  RecommendationDto,
  VulnerabilityDto,
} from '@/entities/analysis/model/types'
import { AnalysisDetailsType } from '@/widgets/analysis/model/useAnalysisPage'
import { AnalysisStatsCard } from '@/entities/analysis/ui/AnalysisStatsCard'
import { VulnerabilityCard } from '@/entities/analysis/ui/VulnerabilityCard'
import { ExplanationCard } from '@/entities/analysis/ui/ExplanationCard'
import { RecommendationCard } from '@/entities/analysis/ui/RecommendationCard'
import { CheckCircle, FileText, Info, Shield } from 'lucide-react'
import { useMemo } from 'react'

interface AnalysisCompletedSectionProps {
  report: AnalysisReportDto
  projectStats: {
    totalVulnerabilities: number
    criticalVulnerabilities: number
    totalExplanations: number
    totalRecommendations: number
  }
  statsLoading: boolean
  onViewDetails: (type: AnalysisDetailsType) => Promise<void>
  isDetailsOpen: boolean
}

export function AnalysisCompletedSection({
  report,
  projectStats,
  statsLoading,
  onViewDetails,
  isDetailsOpen,
}: AnalysisCompletedSectionProps) {
  const vulnerabilities: VulnerabilityDto[] = useMemo(() => 
    Array.isArray(report.result?.vulnerabilities)
      ? (report.result?.vulnerabilities as VulnerabilityDto[])
      : [], [report.result?.vulnerabilities]
  )
  
  const explanations: CodeExplanationDto[] = useMemo(() =>
    Array.isArray(report.result?.explanations)
      ? (report.result?.explanations as CodeExplanationDto[])
      : [], [report.result?.explanations]
  )
  
  const recommendations: (string | RecommendationDto)[] = useMemo(() =>
    Array.isArray(report.result?.recommendations)
      ? (report.result?.recommendations as (string | RecommendationDto)[])
      : [], [report.result?.recommendations]
  )

  const renderRecommendation = (recommendation: string | RecommendationDto, index: number) => {
    if (typeof recommendation === 'object') {
      return (
        <RecommendationCard
          key={recommendation.id ?? `rec-${index}`}
          recommendation={recommendation}
        />
      )
    }

    return (
      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
        <Badge variant="outline" className="mt-1">
          Улучшение
        </Badge>
        <p className="text-sm">{recommendation}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Информация о сканировании */}
      {(report.result?.filesScanned || report.result?.totalScanTime || report.result?.vulnerabilitiesFound) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Информация о сканировании
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.result?.filesScanned && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.result.filesScanned}</div>
                  <p className="text-sm text-muted-foreground">Файлов просканировано</p>
                </div>
              )}
              {report.result?.totalScanTime && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.result.totalScanTime}с</div>
                  <p className="text-sm text-muted-foreground">Время сканирования</p>
                </div>
              )}
              {report.result?.vulnerabilitiesFound && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.result.vulnerabilitiesFound}</div>
                  <p className="text-sm text-muted-foreground">Уязвимостей найдено</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <AnalysisStatsCard
        stats={projectStats}
        statsLoading={statsLoading}
        onViewDetails={onViewDetails}
      />

      {/* Детали результатов */}
      {!isDetailsOpen && vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Найденные уязвимости
            </CardTitle>
            <CardDescription>Проблемы безопасности, требующие внимания</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vulnerabilities.map((vulnerability, index) => (
                <VulnerabilityCard key={vulnerability?.id ?? `vuln-${index}`} vulnerability={vulnerability} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isDetailsOpen && explanations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Объяснения кода
            </CardTitle>
            <CardDescription>AI-объяснения функций и компонентов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {explanations.map((explanation, index) => (
                <ExplanationCard key={explanation?.id ?? `expl-${index}`} explanation={explanation} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isDetailsOpen && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Рекомендации по улучшению
            </CardTitle>
            <CardDescription>Предложения по оптимизации кода</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => renderRecommendation(recommendation, index))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сообщение если нет результатов */}
      {vulnerabilities.length === 0 && explanations.length === 0 && recommendations.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <div>
            <AlertTitle>Анализ завершен</AlertTitle>
            <AlertDescription>
              Результаты анализа не содержат уязвимостей, объяснений или рекомендаций.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}