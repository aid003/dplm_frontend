"use client"

import { Button } from '@/shared/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { MarkdownRenderer } from '@/shared/components/ui/markdown-renderer'
import type { CodeExplanationDto } from '../model/types'

interface ExplanationCardProps {
  explanation: CodeExplanationDto
}

export function ExplanationCard({ explanation }: ExplanationCardProps) {
  const [copied, setCopied] = useState(false)

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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Объяснение кода</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(explanation.explanation)}
          className="h-8 px-3 text-sm"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
      </div>

      {/* Markdown содержимое */}
      <div className="prose prose-sm max-w-none">
        <MarkdownRenderer content={explanation.explanation} />
      </div>
    </div>
  )
}
