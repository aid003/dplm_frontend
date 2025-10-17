export type ProjectStatus = 'PROCESSING' | 'READY' | 'ERROR'

export type Project = {
  id: string
  name: string
  description?: unknown
  zipPath: string
  extractedPath: string
  jobId: string
  status: ProjectStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export type UploadProgressResponse = {
  // Прогресс в процентах, может отсутствовать, если бэкенд возвращает пустой ответ
  progress?: number
  // Возможный статус с бэкенда, если он его присылает
  status?: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR'
}

// SSE прогресс загрузки/распаковки
export type ProgressPhase = 'queued' | 'extracting' | 'done' | 'error'

export interface SseProgressEvent {
  jobId: string
  phase: ProgressPhase
  percent: number
  message?: string
}


