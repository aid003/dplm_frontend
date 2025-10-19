"use client"

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { 
  FileText, 
  Zap, 
  Square, 
  Variable,
  Copy,
  Check,
  Brain
} from 'lucide-react'
import { useState } from 'react'
import type { CodeExplanationDto } from '../model/types'

interface ExplanationCardProps {
  explanation: CodeExplanationDto
}

export function ExplanationCard({ explanation }: ExplanationCardProps) {
  const [copied, setCopied] = useState(false)

  const getSymbolIcon = (symbolType?: string) => {
    switch (symbolType?.toLowerCase()) {
      case 'function':
      case 'method':
        return <Zap className="h-4 w-4" />
      case 'class':
      case 'interface':
        return <Square className="h-4 w-4" />
      case 'variable':
      case 'const':
      case 'let':
        return <Variable className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getComplexityColor = (complexity?: number) => {
    if (!complexity) return 'secondary'
    
    if (complexity <= 3) return 'default'
    if (complexity <= 7) return 'secondary'
    return 'destructive'
  }

  const getComplexityText = (complexity?: number) => {
    if (!complexity) return 'Неизвестно'
    
    if (complexity <= 3) return 'Низкая'
    if (complexity <= 7) return 'Средняя'
    return 'Высокая'
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getSymbolIcon(explanation.symbolType)}
          {explanation.symbolName && (
            <span className="font-medium text-lg">{explanation.symbolName}</span>
          )}
          {explanation.symbolType && (
            <Badge variant="outline">{explanation.symbolType}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {explanation.filePath}:{explanation.lineStart}
            {explanation.lineEnd !== explanation.lineStart && `-${explanation.lineEnd}`}
          </span>
        </div>
      </div>

      {/* Краткое описание */}
      <div>
        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          {explanation.summary}
        </h4>
      </div>

      {/* Подробное объяснение */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Подробное объяснение:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(explanation.detailed)}
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
        <div className="bg-muted p-3 rounded text-sm">
          <p className="whitespace-pre-wrap">{explanation.detailed}</p>
        </div>
      </div>

      {/* Сложность */}
      {explanation.complexity !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Цикломатическая сложность:</span>
          <Badge variant={getComplexityColor(explanation.complexity)}>
            {explanation.complexity} ({getComplexityText(explanation.complexity)})
          </Badge>
        </div>
      )}

      {/* Метаданные */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        <div>Создано: {new Date(explanation.createdAt).toLocaleString('ru-RU')}</div>
        <div>ID: {explanation.id}</div>
      </div>
    </div>
  )
}
