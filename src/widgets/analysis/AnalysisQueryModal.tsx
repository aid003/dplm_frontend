"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import type { AnalysisType } from '@/entities/analysis/model/types'

interface AnalysisQueryModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: (query?: string) => void
  onSkip: () => void
  analysisType: AnalysisType
}

const QUERY_EXAMPLES = [
  'как работает авторизация пользователей',
  'обработка HTTP запросов',
  'работа с базой данных',
  'валидация входных данных',
  'обработка ошибок',
  'API эндпоинты',
  'конфигурация приложения',
  'логирование и мониторинг'
]

export function AnalysisQueryModal({
  isOpen,
  onClose,
  onStart,
  onSkip,
  analysisType
}: AnalysisQueryModalProps) {
  const [query, setQuery] = useState('')

  const handleStart = () => {
    onStart(query.trim() || undefined)
    setQuery('')
  }

  const handleSkip = () => {
    onSkip()
    setQuery('')
  }

  const handleClose = () => {
    onClose()
    setQuery('')
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  const getModalTitle = () => {
    switch (analysisType) {
      case 'EXPLANATION':
        return 'Целевое объяснение кода'
      case 'FULL':
        return 'Целевой полный анализ'
      default:
        return 'Целевой анализ кода'
    }
  }

  const getModalDescription = () => {
    switch (analysisType) {
      case 'EXPLANATION':
        return 'Опишите, что именно вы хотите понять в коде. Система найдет и объяснит только релевантные части.'
      case 'FULL':
        return 'Опишите тему для анализа. Система проанализирует только релевантные файлы по вашей теме.'
      default:
        return 'Опишите, что вас интересует в коде. Система найдет и проанализирует только релевантные файлы.'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎯 {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="query">
              Тема анализа (опционально)
            </Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: как работает авторизация пользователей"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Популярные темы:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {QUERY_EXAMPLES.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <div className="text-sm">
                {query.trim() ? (
                  <>
                    🎯 <strong>Целевой анализ</strong>
                    <br />
                    <span className="text-muted-foreground">
                      Анализируются только релевантные файлы по теме: &quot;{query}&quot;
                    </span>
                  </>
                ) : (
                  <>
                    📊 <strong>Полный анализ</strong>
                    <br />
                    <span className="text-muted-foreground">
                      Анализируются все файлы проекта
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button variant="outline" onClick={handleSkip}>
            Пропустить (полный анализ)
          </Button>
          <Button onClick={handleStart}>
            {query.trim() ? 'Запустить целевой анализ' : 'Запустить полный анализ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
