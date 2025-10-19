import { create } from 'zustand'
import type {
  AnalysisStoreState,
  AnalysisStoreActions,
  AnalysisRequestDto,
} from './types'
import {
  startAnalysis as startAnalysisApi,
  getAnalysisStatus,
  getAnalysisResults,
  cancelAnalysis as cancelAnalysisApi,
} from '../api'

const POLLING_INTERVAL = 2000 // 2 секунды

export const useAnalysisStore = create<AnalysisStoreState & AnalysisStoreActions>((set, get) => ({
  // Состояние
  currentReport: null,
  status: null,
  loading: false,
  error: null,
  pollingIntervalId: null,

  // Действия
  async startAnalysis(projectId: string, request: AnalysisRequestDto) {
    if (!projectId) {
      const error = 'ID проекта не указан'
      set({ error, loading: false })
      throw new Error(error)
    }
    
    set({ loading: true, error: null })
    
    try {
      const report = await startAnalysisApi(projectId, request)
      set({ 
        currentReport: report, 
        status: report.status,
        loading: false 
      })
      
      // Автоматически запускаем polling если анализ не завершен
      if ((report.status === 'PENDING' || report.status === 'PROCESSING') && report.id) {
        get().pollStatus(report.id)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка запуска анализа'
      set({ error: message, loading: false })
      throw error
    }
  },

  async pollStatus(reportId: string) {
    if (!reportId) {
      return
    }
    
    // Останавливаем предыдущий polling если он есть
    get().stopPolling()
    
    let retryCount = 0
    const maxRetries = 3
    let isPollingActive = true
    
    const scheduleNextPoll = () => {
      if (!isPollingActive) {
        return
      }
      
      const timeoutId = setTimeout(() => {
        if (isPollingActive) {
          poll().catch(error => {
            console.error('Ошибка в scheduled polling:', error)
          })
        }
      }, POLLING_INTERVAL)
      
      set({ pollingIntervalId: timeoutId })
    }
    
    const poll = async () => {
      try {
        const statusData = await getAnalysisStatus(reportId)
        retryCount = 0 // Сброс счетчика при успешном запросе
        
        set((state) => ({
          status: statusData.status,
          currentReport: state.currentReport ? {
            ...state.currentReport,
            status: statusData.status,
            progress: statusData.progress,
          } : null,
        }))
        
        // Если анализ завершен (успешно или с ошибкой), останавливаем polling
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(statusData.status)) {
          isPollingActive = false
          get().stopPolling()
          
          // Если анализ завершен успешно, загружаем результаты
          if (statusData.status === 'COMPLETED') {
            get().fetchResults(reportId)
          }
        } else {
          scheduleNextPoll()
        }
      } catch (error) {
        console.error('Ошибка при опросе статуса:', error)
        retryCount++
        
        // Если превышено количество попыток, останавливаем polling
        if (retryCount >= maxRetries) {
          isPollingActive = false
          get().stopPolling()
          set({ error: 'Ошибка получения статуса анализа. Проверьте подключение к серверу.' })
        } else {
          scheduleNextPoll()
        }
      }
    }
    
    // Запускаем первый опрос сразу
    await poll()
    
    // Планируем следующий опрос
    scheduleNextPoll()
  },

  stopPolling() {
    const { pollingIntervalId } = get()
    if (pollingIntervalId) {
      clearTimeout(pollingIntervalId)
      set({ pollingIntervalId: null })
    }
  },

  async cancelAnalysis(reportId: string) {
    if (!reportId) {
      const error = 'ID отчета не указан'
      set({ error })
      throw new Error(error)
    }
    
    try {
      await cancelAnalysisApi(reportId)
      
      set((state) => ({
        status: 'CANCELLED',
        currentReport: state.currentReport ? {
          ...state.currentReport,
          status: 'CANCELLED',
        } : null,
      }))
      
      get().stopPolling()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка отмены анализа'
      set({ error: message })
      throw error
    }
  },

  async fetchResults(reportId: string) {
    if (!reportId) {
      const error = 'ID отчета не указан'
      set({ error })
      throw new Error(error)
    }

    try {
      const report = await getAnalysisResults(reportId)
      set({
        currentReport: report,
        status: report.status
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки результатов'
      set({ error: message })
      throw error
    }
  },

  reset() {
    get().stopPolling()
    set({
      currentReport: null,
      status: null,
      loading: false,
      error: null,
      pollingIntervalId: null,
    })
  },

  setError(error: string | null) {
    set({ error })
  },
}))