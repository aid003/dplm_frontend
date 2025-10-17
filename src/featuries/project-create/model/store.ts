import { create } from 'zustand'
import type { Project } from '@/entities/project/model/types'
import { createProject, getUploadProgress } from '@/entities/project/api'

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

const POLL_INTERVAL_MS = 1000

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

      // Polling прогресса распаковки по jobId
      const jobId = project.jobId
      if (!jobId) {
        set({ status: 'ERROR', creating: false, error: 'jobId не получен от сервера' })
        return
      }

      let isDone = false
      while (!isDone) {
        // Ждём интервал
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))

        // eslint-disable-next-line no-await-in-loop
        const { progress } = await getUploadProgress(jobId)
        const nextProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0
        set({ progress: nextProgress })

        if (nextProgress >= 100) {
          isDone = true
        }
      }

      set({ status: 'READY', creating: false, progress: 100 })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось создать проект'
      set({ error: message, creating: false, status: 'ERROR' })
    }
  },
}))


