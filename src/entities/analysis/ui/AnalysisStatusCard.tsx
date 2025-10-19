"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { Button } from '@/shared/components/ui/button'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  X,
  RefreshCw
} from 'lucide-react'
import type { AnalysisReportDto, AnalysisStatus } from '../model/types'

interface AnalysisStatusCardProps {
  report: AnalysisReportDto
  onCancel?: () => void
  onRetry?: () => void
}

export function AnalysisStatusCard({ report, onCancel, onRetry }: AnalysisStatusCardProps) {
  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <X className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case 'PENDING':
        return 'secondary'
      case 'PROCESSING':
        return 'default'
      case 'COMPLETED':
        return 'default'
      case 'FAILED':
        return 'destructive'
      case 'CANCELLED':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: AnalysisStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидание'
      case 'PROCESSING':
        return 'Выполняется'
      case 'COMPLETED':
        return 'Завершен'
      case 'FAILED':
        return 'Ошибка'
      case 'CANCELLED':
        return 'Отменен'
      default:
        return 'Неизвестно'
    }
  }

  const isInProgress = report.status === 'PENDING' || report.status === 'PROCESSING'
  const hasError = report.status === 'FAILED'
  const isCompleted = report.status === 'COMPLETED'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(report.status)}
            <CardTitle>Статус анализа</CardTitle>
          </div>
          <Badge variant={getStatusColor(report.status)}>
            {getStatusText(report.status)}
          </Badge>
        </div>
        <CardDescription>
          {report.type === 'FULL' && 'Полный анализ проекта'}
          {report.type === 'VULNERABILITY' && 'Анализ уязвимостей'}
          {report.type === 'EXPLANATION' && 'Объяснение кода'}
          {report.type === 'RECOMMENDATION' && 'Рекомендации по улучшению'}
          {report.filePath && ` - ${report.filePath}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Прогресс */}
        {isInProgress && report.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{report.progress.currentStep}</span>
              <span>{report.progress.percentage}%</span>
            </div>
            <Progress value={report.progress.percentage} className="w-full" />
            <div className="text-sm text-muted-foreground">
              Обработано файлов: {report.progress.processedFiles} из {report.progress.totalFiles}
              {report.progress.currentFile && (
                <div className="mt-1">
                  Текущий файл: <code className="text-xs bg-muted px-1 rounded">{report.progress.currentFile}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ошибка */}
        {hasError && report.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {report.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Успешное завершение */}
        {isCompleted && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Анализ успешно завершен {new Date(report.updatedAt).toLocaleString('ru-RU')}
            </AlertDescription>
          </Alert>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2">
          {isInProgress && onCancel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Отменить анализ
            </Button>
          )}
          
          {hasError && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Повторить
            </Button>
          )}
        </div>

        {/* Информация о времени */}
        <div className="text-sm text-muted-foreground">
          <div>Создан: {new Date(report.createdAt).toLocaleString('ru-RU')}</div>
          {report.updatedAt !== report.createdAt && (
            <div>Обновлен: {new Date(report.updatedAt).toLocaleString('ru-RU')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
