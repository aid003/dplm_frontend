"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import type {
  AnalysisReportDto,
  RecommendationDto,
  VulnerabilityDto,
} from '@/entities/analysis/model/types'
import { AnalysisDetailsType } from '@/widgets/analysis/model/useAnalysisPage'
import { AnalysisStatsCard } from '@/entities/analysis/ui/AnalysisStatsCard'
import { VulnerabilityCard } from '@/entities/analysis/ui/VulnerabilityCard'
import { ExplanationCard } from '@/entities/analysis/ui/ExplanationCard'
import { RecommendationCard } from '@/entities/analysis/ui/RecommendationCard'
import { CheckCircle, Info, Shield, FileText } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { getAnalysisResults } from '@/entities/analysis/api'

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
  const [fullReport, setFullReport] = useState<AnalysisReportDto | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  // Загружаем полный отчет через /reports/:reportId
  useEffect(() => {
    if (report.id && report.status === 'COMPLETED' && !fullReport && !reportLoading) {
      setReportLoading(true)
      setReportError(null)
      
      getAnalysisResults(report.id)
        .then((result) => {
          setFullReport(result)
          setReportLoading(false)
        })
        .catch((error) => {
          console.error('Ошибка загрузки результатов:', error)
          setReportError(error instanceof Error ? error.message : 'Ошибка загрузки результатов')
          setReportLoading(false)
        })
    }
  }, [report.id, report.status, fullReport, reportLoading])

  // Используем данные из полного отчета или из исходного отчета
  const currentReport = fullReport || report

  const vulnerabilities: VulnerabilityDto[] = useMemo(() => 
    Array.isArray(currentReport.result?.vulnerabilities)
      ? (currentReport.result?.vulnerabilities as VulnerabilityDto[])
      : [], [currentReport.result?.vulnerabilities]
  )
  
  const recommendations: (string | RecommendationDto)[] = useMemo(() =>
    Array.isArray(currentReport.result?.recommendations)
      ? (currentReport.result?.recommendations as (string | RecommendationDto)[])
      : [], [currentReport.result?.recommendations]
  )

  // Для анализа типа EXPLANATION объяснение должно быть в результате
  const explanation = useMemo(() => {
    if (currentReport.type === 'EXPLANATION' && currentReport.result?.explanation) {
      return { explanation: currentReport.result.explanation }
    }
    return null
  }, [currentReport.type, currentReport.result?.explanation])

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

      {/* Объяснение для анализа типа EXPLANATION */}
      {!isDetailsOpen && report.type === 'EXPLANATION' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Объяснение кода
            </CardTitle>
            <CardDescription>AI-объяснение на основе вашего запроса</CardDescription>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Загрузка результатов анализа...</p>
                </div>
              </div>
            ) : reportError ? (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <div>
                  <AlertTitle>Ошибка загрузки</AlertTitle>
                  <AlertDescription>{reportError}</AlertDescription>
                </div>
              </Alert>
            ) : explanation ? (
              <ExplanationCard explanation={explanation} />
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <div>
                  <AlertTitle>Объяснение недоступно</AlertTitle>
                  <AlertDescription>
                    Объяснение не найдено в результате анализа.
                  </AlertDescription>
                </div>
              </Alert>
            )}
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
      {vulnerabilities.length === 0 && recommendations.length === 0 && !explanation && (
        <Alert>
          <Info className="h-4 w-4" />
          <div>
            <AlertTitle>Анализ завершен</AlertTitle>
            <AlertDescription>
              Результаты анализа не содержат уязвимостей, рекомендаций или объяснений.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}