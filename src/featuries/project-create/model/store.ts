import { create } from 'zustand'
import type { Project } from '@/entities/project/model/types'
import { createProject, listMyProjects, subscribeToUploadProgress } from '@/entities/project/api'

type CreateStatus = 'IDLE' | 'PROCESSING' | 'READY' | 'ERROR'

type ProjectCreateState = {
  creating: boolean
  progress: number
  status: CreateStatus
  project?: Project
  error?: string
}

type ProjectCreateActions = {
  create: (formData: FormData) => Promise<void>
}

const PROJECT_STATUS_POLL_MS = 2000
const MAX_WAIT_MS = 5 * 60 * 1000 // 5 минут

export const useProjectCreateStore = create<ProjectCreateState & ProjectCreateActions>((set) => ({
  creating: false,
  progress: 0,
  status: 'IDLE',
  project: undefined,
  error: undefined,

  async create(formData: FormData) {
    set({ creating: true, progress: 0, status: 'PROCESSING', error: undefined, project: undefined })
    try {
      const project = await createProject(formData)
      set({ project })

      // Подписка на прогресс распаковки по jobId через SSE
      const jobId = project.jobId
      if (!jobId) {
        set({ status: 'ERROR', creating: false, error: 'jobId не получен от сервера' })
        return
      }

      let finished = false
      const startedAt = Date.now()

      const unsubscribe = subscribeToUploadProgress(jobId, {
        onEvent: (e) => {
          const next = Math.max(0, Math.min(100, e.percent))
          set({ progress: next })
          if (e.phase === 'done') {
            finished = true
            unsubscribe()
            void (async () => {
              // Финальная проверка статуса проекта пользователя
              const mine = await listMyProjects().catch(() => [])
              const updated = mine.find((p) => p.id === project.id)
              if (updated) {
                if (updated.status === 'READY') {
                  set({ project: updated, status: 'READY', creating: false, progress: 100 })
                  return
                }
                if (updated.status === 'ERROR') {
                  set({ project: updated, status: 'ERROR', creating: false, error: 'Ошибка распаковки проекта' })
                  return
                }
              }
              set({ status: 'READY', creating: false, progress: 100 })
            })()
          } else if (e.phase === 'error') {
            finished = true
            unsubscribe()
            set({ status: 'ERROR', creating: false, error: e.message ?? 'Ошибка распаковки проекта' })
          }
        },
        onError: () => {
          if (!finished) {
            set({ status: 'ERROR', creating: false, error: 'Поток прогресса прерван' })
          }
        },
        onDone: () => {
          // Если поток закрылся без явного done/error, защитимся таймаутом
          if (!finished) {
            const elapsed = Date.now() - startedAt
            if (elapsed > MAX_WAIT_MS) {
              set({ status: 'ERROR', creating: false, error: 'Операция распаковки превысила время ожидания' })
            }
          }
        },
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось создать проект'
      set({ error: message, creating: false, status: 'ERROR' })
    }
  },
}))


