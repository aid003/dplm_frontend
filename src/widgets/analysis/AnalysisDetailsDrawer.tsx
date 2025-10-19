"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Spinner } from '@/shared/components/ui/spinner'
import type { AnalysisDetailsView } from '@/widgets/analysis/model/useAnalysisPage'
import type { RecommendationDto, VulnerabilityDto, CodeExplanationDto } from '@/entities/analysis/model/types'
import { CheckCircle, FileText, Info, Shield, AlertCircle } from 'lucide-react'
import { VulnerabilityCard } from '@/entities/analysis/ui/VulnerabilityCard'
import { ExplanationCard } from '@/entities/analysis/ui/ExplanationCard'
import { RecommendationCard } from '@/entities/analysis/ui/RecommendationCard'

interface AnalysisDetailsDrawerProps {
  view: AnalysisDetailsView
  onClose: () => void
}

const detailTitleMap: Record<Exclude<AnalysisDetailsView['type'], null>, string> = {
  vulnerabilities: 'уязвимости',
  explanations: 'объяснения',
  recommendations: 'рекомендации',
}

export function AnalysisDetailsDrawer({ view, onClose }: AnalysisDetailsDrawerProps) {
  if (!view.type) {
    return null
  }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {view.type === 'vulnerabilities' && <Shield className="h-5 w-5" />}
            {view.type === 'explanations' && <FileText className="h-5 w-5" />}
            {view.type === 'recommendations' && <CheckCircle className="h-5 w-5" />}
            Все {detailTitleMap[view.type]} ({view.data.length})
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Закрыть
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {view.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Spinner className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Загрузка данных...</span>
              </div>
            </div>
          ) : view.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <AlertTitle>Ошибка загрузки</AlertTitle>
                <AlertDescription>{view.error}</AlertDescription>
              </div>
            </Alert>
          ) : view.data.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <div>
                <AlertTitle>Данные не найдены</AlertTitle>
                <AlertDescription>
                  {view.type === 'vulnerabilities' && 'Уязвимостей не найдено в проекте'}
                  {view.type === 'explanations' && 'Объяснений не найдено в проекте'}
                  {view.type === 'recommendations' && 'Рекомендаций не найдено в проекте'}
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <>
              {view.type === 'vulnerabilities' &&
                view.data.map((vulnerability: VulnerabilityDto, index: number) => (
                  <VulnerabilityCard key={vulnerability.id ?? `vuln-${index}`} vulnerability={vulnerability} />
                ))}

              {view.type === 'explanations' &&
                view.data.map((explanation: CodeExplanationDto, index: number) => (
                  <ExplanationCard key={explanation.id ?? `expl-${index}`} explanation={explanation} />
                ))}

              {view.type === 'recommendations' &&
                view.data.map((recommendation, index: number) => renderRecommendation(recommendation, index))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
