"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import {
  Shield,
  FileText,
  CheckCircle,
  Globe,
  ChevronRight,
  Eye
} from 'lucide-react'
import { useState } from 'react'

interface AnalysisStatsCardProps {
  stats: {
    totalVulnerabilities: number
    criticalVulnerabilities: number
    totalExplanations: number
    totalRecommendations: number
  }
  statsLoading: boolean
  onViewDetails: (type: 'vulnerabilities' | 'explanations' | 'recommendations') => Promise<void>
}

export function AnalysisStatsCard({
  stats,
  statsLoading,
  onViewDetails,
}: AnalysisStatsCardProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const handleCardClick = (type: 'vulnerabilities' | 'explanations' | 'recommendations') => {
    if (expandedCard === type) {
      setExpandedCard(null)
    } else {
      setExpandedCard(type)
    }
  }

  const handleViewDetails = async (type: 'vulnerabilities' | 'explanations' | 'recommendations') => {
    await onViewDetails(type)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Уязвимости */}
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${expandedCard === 'vulnerabilities' ? 'ring-2 ring-orange-500' : ''}`}
        onClick={() => handleCardClick('vulnerabilities')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Уязвимости
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedCard === 'vulnerabilities' ? 'rotate-90' : ''}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : stats.totalVulnerabilities}
          </div>
          <p className="text-xs text-muted-foreground">
            {statsLoading ? '...' : stats.criticalVulnerabilities} критических
          </p>
          {expandedCard === 'vulnerabilities' && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  void handleViewDetails('vulnerabilities')
                }}
                className="w-full"
                disabled={statsLoading}
              >
                <Eye className="h-3 w-3 mr-2" />
                Просмотреть все
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Объяснения */}
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${expandedCard === 'explanations' ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => handleCardClick('explanations')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Объяснения
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedCard === 'explanations' ? 'rotate-90' : ''}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : stats.totalExplanations}
          </div>
          <p className="text-xs text-muted-foreground">
            Функций и компонентов
          </p>
          {expandedCard === 'explanations' && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  void handleViewDetails('explanations')
                }}
                className="w-full"
                disabled={statsLoading}
              >
                <Eye className="h-3 w-3 mr-2" />
                Просмотреть все
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Рекомендации */}
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${expandedCard === 'recommendations' ? 'ring-2 ring-green-500' : ''}`}
        onClick={() => handleCardClick('recommendations')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Рекомендации
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedCard === 'recommendations' ? 'rotate-90' : ''}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsLoading ? '...' : stats.totalRecommendations}
          </div>
          <p className="text-xs text-muted-foreground">
            Предложений по улучшению
          </p>
          {expandedCard === 'recommendations' && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  void handleViewDetails('recommendations')
                }}
                className="w-full"
                disabled={statsLoading}
              >
                <Eye className="h-3 w-3 mr-2" />
                Просмотреть все
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Язык */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Язык
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            all
          </div>
          <p className="text-xs text-muted-foreground">
            Основной язык проекта
          </p>
        </CardContent>
      </Card>
    </div>
  )
}