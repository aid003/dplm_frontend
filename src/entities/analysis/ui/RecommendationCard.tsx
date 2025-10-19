"use client"

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Lightbulb,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { RecommendationDto } from '../model/types'

interface RecommendationCardProps {
  recommendation: RecommendationDto
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [copied, setCopied] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4" />
      case 'MEDIUM':
        return <Info className="h-4 w-4" />
      case 'LOW':
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Код скопирован')
    } catch (error) {
      console.error('Ошибка копирования:', error)
      toast.error('Ошибка копирования')
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-3">
      {/* Заголовок и приоритет */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getPriorityIcon(recommendation.priority)}
          <Badge variant="outline">{recommendation.category}</Badge>
          <Badge variant={getPriorityColor(recommendation.priority)}>
            {recommendation.priority}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {recommendation.filePath.split('/').pop()}:{recommendation.lineStart}
          {recommendation.lineEnd && recommendation.lineEnd !== recommendation.lineStart && `-${recommendation.lineEnd}`}
        </span>
      </div>

      {/* Заголовок и описание */}
      <div>
        <h4 className="font-semibold text-base mb-1">{recommendation.title}</h4>
        <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
      </div>

      {/* Рекомендация */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Рекомендация:
        </p>
        <p className="text-blue-700 dark:text-blue-300">{recommendation.suggestion}</p>
      </div>

      {/* Код с проблемой */}
      {recommendation.codeSnippet && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Проблемный код:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(recommendation.codeSnippet!)}
              className="h-6 px-2 text-xs"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
          </div>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
            <code>{recommendation.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Метаданные */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        <div>Влияние: {recommendation.impact}</div>
        <div>ID: {recommendation.id}</div>
      </div>
    </div>
  )
}
