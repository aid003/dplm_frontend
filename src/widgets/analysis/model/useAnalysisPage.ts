"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useProjectsStore } from '@/entities/project/model/store'
import { useAnalysisStore } from '@/entities/analysis/model/store'
import { getVulnerabilities, getRecommendations } from '@/entities/analysis/api'
import type {
  AnalysisRequestDto,
  AnalysisReportDto,
  AnalysisType,
  CodeExplanationDto,
  RecommendationDto,
  VulnerabilityDto,
} from '@/entities/analysis/model/types'
import type { Project } from '@/entities/project/model/types'

export type AnalysisDetailsType = 'vulnerabilities' | 'explanations' | 'recommendations'

type AnalysisDetailsDataMap = {
  vulnerabilities: VulnerabilityDto[]
  explanations: CodeExplanationDto[]
  recommendations: RecommendationDto[]
}

export type AnalysisDetailsView =
  | { type: 'vulnerabilities'; data: AnalysisDetailsDataMap['vulnerabilities']; loading?: boolean; error?: string }
  | { type: 'explanations'; data: AnalysisDetailsDataMap['explanations']; loading?: boolean; error?: string }
  | { type: 'recommendations'; data: AnalysisDetailsDataMap['recommendations']; loading?: boolean; error?: string }
  | { type: null; data: [] }

interface ProjectStats {
  totalVulnerabilities: number
  criticalVulnerabilities: number
  totalExplanations: number
  totalRecommendations: number
}

interface UseAnalysisPageResult {
  projects: Project[]
  projectsLoading: boolean
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  selectedProject?: Project
  analysisType: AnalysisType
  setAnalysisType: (type: AnalysisType) => void
  includeTests: boolean
  setIncludeTests: (value: boolean) => void
  languages: string
  setLanguages: (value: string) => void
  analysisLoading: boolean
  currentReport: AnalysisReportDto | null
  handleStartAnalysis: () => Promise<void>
  handleCancelAnalysis: () => Promise<void>
  handleReset: () => void
  handleRetry: () => Promise<void>
  projectStats: ProjectStats
  statsLoading: boolean
  viewingDetails: AnalysisDetailsView
  handleViewDetails: (type: AnalysisDetailsType) => Promise<void>
  handleCloseDetails: () => void
  // Modal state
  isQueryModalOpen: boolean
  openQueryModal: () => void
  closeQueryModal: () => void
  handleStartWithQuery: (query?: string) => Promise<void>
}

export function useAnalysisPage(): UseAnalysisPageResult {
  // Projects
  const projects = useProjectsStore((state) => state.projects)
  const projectsLoading = useProjectsStore((state) => state.loading)
  const fetchProjects = useProjectsStore((state) => state.fetchProjects)

  // Analysis store
  const currentReport = useAnalysisStore((state) => state.currentReport)
  const analysisLoading = useAnalysisStore((state) => state.loading)
  const analysisError = useAnalysisStore((state) => state.error)
  const startAnalysis = useAnalysisStore((state) => state.startAnalysis)
  const cancelAnalysis = useAnalysisStore((state) => state.cancelAnalysis)
  const resetStore = useAnalysisStore((state) => state.reset)
  const setError = useAnalysisStore((state) => state.setError)

  // Local state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('FULL')
  const [includeTests, setIncludeTests] = useState<boolean>(false)
  const [languages, setLanguages] = useState<string>('')
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    totalExplanations: 0,
    totalRecommendations: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [viewingDetails, setViewingDetails] = useState<AnalysisDetailsView>({
    type: null,
    data: [],
  })
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)

  // Load projects on mount
  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  // Load stats when project changes
  const loadProjectStats = useCallback(async (projectId: string) => {
    if (!projectId) return

    setStatsLoading(true)
    try {
      const [vulnerabilitiesResult, recommendationsResult] = await Promise.allSettled([
        getVulnerabilities(projectId),
        getRecommendations(projectId)
      ])

      let totalVulnerabilities = 0
      let criticalVulnerabilities = 0
      let totalExplanations = 0
      let totalRecommendations = 0

      if (vulnerabilitiesResult.status === 'fulfilled') {
        totalVulnerabilities = vulnerabilitiesResult.value.vulnerabilities.length
        criticalVulnerabilities = vulnerabilitiesResult.value.vulnerabilities.filter(v => 
          v.severity && ['HIGH', 'CRITICAL'].includes(v.severity.toUpperCase())
        ).length
      }

      if (recommendationsResult.status === 'fulfilled') {
        totalRecommendations = recommendationsResult.value.recommendations.length
      }

      // Для объяснений пока ставим 0, так как нет отдельного API для их получения
      // В будущем можно добавить endpoint для получения списка объяснений
      totalExplanations = 0

      setProjectStats({
        totalVulnerabilities,
        criticalVulnerabilities,
        totalExplanations,
        totalRecommendations,
      })
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Load stats when project changes
  useEffect(() => {
    if (selectedProjectId) {
      void loadProjectStats(selectedProjectId)
    }
  }, [selectedProjectId, loadProjectStats])

  // Handle analysis errors
  useEffect(() => {
    if (analysisError) {
      toast.error(analysisError)
      setError(null)
    }
  }, [analysisError, setError])

  // Update stats when analysis completes
  useEffect(() => {
    if (currentReport?.status === 'COMPLETED' && selectedProjectId) {
      // Обновляем статистику после завершения анализа
      void loadProjectStats(selectedProjectId)
    }
  }, [currentReport?.status, selectedProjectId, loadProjectStats])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetStore()
    }
  }, [resetStore])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  )

  const handleStartWithQuery = useCallback(async (query?: string) => {
    if (!selectedProjectId) {
      toast.error('Выберите проект для анализа')
      return
    }

    if (!selectedProject) {
      toast.error('Проект не найден')
      return
    }

    if (selectedProject.status !== 'READY') {
      toast.error('Проект должен быть готов для анализа')
      return
    }

    try {
      const request: AnalysisRequestDto = {
        type: analysisType,
        ...(query && { query }),
        options: {
          includeTests,
          ...(languages && {
            languages: languages
              .split(',')
              .map((language) => language.trim())
              .filter(Boolean),
          }),
        },
      }

      await startAnalysis(selectedProjectId, request)
      toast.success(query ? 'Целевой анализ запущен' : 'Анализ запущен')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка запуска анализа'
      toast.error(message)
    }
  }, [analysisType, includeTests, languages, selectedProject, selectedProjectId, startAnalysis])

  const handleStartAnalysis = useCallback(async () => {
    // Для EXPLANATION и FULL показываем модалку
    if (analysisType === 'EXPLANATION' || analysisType === 'FULL') {
      setIsQueryModalOpen(true)
      return
    }

    // Для остальных типов запускаем сразу
    await handleStartWithQuery()
  }, [analysisType, handleStartWithQuery])

  const openQueryModal = useCallback(() => {
    setIsQueryModalOpen(true)
  }, [])

  const closeQueryModal = useCallback(() => {
    setIsQueryModalOpen(false)
  }, [])

  const handleCancelAnalysis = useCallback(async () => {
    if (!currentReport?.id) {
      toast.error('ID отчета не найден')
      return
    }

    try {
      await cancelAnalysis(currentReport.id)
      toast.success('Анализ отменен')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка отмены анализа'
      toast.error(message)
    }
  }, [cancelAnalysis, currentReport])

  const handleReset = useCallback(() => {
    resetStore()
    setIncludeTests(false)
    setLanguages('')
    toast.info('Состояние сброшено')
  }, [resetStore])

  const handleRetry = useCallback(async () => {
    if (!selectedProjectId || !currentReport) {
      toast.error('Не удалось повторить анализ')
      return
    }

    try {
      const request: AnalysisRequestDto = {
        type: currentReport.type,
        options: {
          includeTests,
          ...(languages && {
            languages: languages
              .split(',')
              .map((language) => language.trim())
              .filter(Boolean),
          }),
        },
      }

      await startAnalysis(selectedProjectId, request)
      toast.success('Повторный анализ запущен')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка повторного запуска анализа'
      toast.error(message)
    }
  }, [currentReport, includeTests, languages, selectedProjectId, startAnalysis])

  const handleViewDetails = useCallback(
    async (type: AnalysisDetailsType) => {
      if (!selectedProjectId) {
        toast.error('Проект не выбран')
        return
      }

      setViewingDetails({ type, data: [], loading: true } as AnalysisDetailsView)

      try {
        let data: VulnerabilityDto[] | CodeExplanationDto[] | RecommendationDto[] = []

        switch (type) {
          case 'vulnerabilities':
            const vulnerabilitiesResult = await getVulnerabilities(selectedProjectId)
            data = vulnerabilitiesResult.vulnerabilities
            break
          case 'explanations':
            // Пока возвращаем пустой массив, так как нет API для получения списка объяснений
            data = []
            break
          case 'recommendations':
            const recommendationsResult = await getRecommendations(selectedProjectId)
            data = recommendationsResult.recommendations
            break
        }

        setViewingDetails({ type, data, loading: false } as AnalysisDetailsView)
        
        // Refresh stats after loading details
        await loadProjectStats(selectedProjectId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка загрузки данных'
        setViewingDetails({ type, data: [], loading: false, error: message } as AnalysisDetailsView)
        toast.error(message)
      }
    },
    [selectedProjectId, loadProjectStats],
  )

  const handleCloseDetails = useCallback(() => {
    setViewingDetails({ type: null, data: [] })
  }, [])

  return {
    projects,
    projectsLoading,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    analysisType,
    setAnalysisType,
    includeTests,
    setIncludeTests,
    languages,
    setLanguages,
    analysisLoading,
    currentReport,
    handleStartAnalysis,
    handleCancelAnalysis,
    handleReset,
    handleRetry,
    projectStats,
    statsLoading,
    viewingDetails,
    handleViewDetails,
    handleCloseDetails,
    // Modal state
    isQueryModalOpen,
    openQueryModal,
    closeQueryModal,
    handleStartWithQuery,
  }
}