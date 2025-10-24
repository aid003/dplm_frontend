import { apiGet, apiPost } from '@/shared/lib/api'
import type {
  AnalysisRequestDto,
  AnalysisReportDto,
  AnalysisStatusDto,
  ExplainRequestDto,
  CodeExplanationDto,
  VulnerabilityDto,
  RecommendationDto,
  VulnerabilityFilters,
  RecommendationFilters,
  AnalysisHistoryFilters,
  AnalysisHistoryDto,
} from '../model/types'

// Валидация UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

const validateUUID = (id: string, fieldName: string): void => {
  if (!id || !isValidUUID(id)) {
    throw new Error(`Invalid ${fieldName}: ${id}`)
  }
}

// Запуск анализа проекта
export async function startAnalysis(
  projectId: string,
  request: AnalysisRequestDto
): Promise<AnalysisReportDto> {
  validateUUID(projectId, 'projectId')
  const result = await apiPost<Record<string, unknown>, AnalysisReportDto>(
    `/analysis/projects/${encodeURIComponent(projectId)}/analyze`,
    request as Record<string, unknown>
  )
  
  // Маппинг reportId -> id для совместимости с типами
  const mappedResult: AnalysisReportDto = {
    ...result,
    id: result.reportId || result.id,
  }
  
  return mappedResult
}

// Получение статуса анализа
export async function getAnalysisStatus(reportId: string): Promise<AnalysisStatusDto> {
  validateUUID(reportId, 'reportId')
  const result = await apiGet<AnalysisStatusDto>(`/analysis/reports/${encodeURIComponent(reportId)}/status`)
  
  // Маппинг reportId -> id для совместимости с типами
  const mappedResult: AnalysisStatusDto = {
    ...result,
    id: result.reportId || result.id,
  }
  
  return mappedResult
}

// Получение результатов анализа
export async function getAnalysisResults(reportId: string): Promise<AnalysisReportDto> {
  validateUUID(reportId, 'reportId')
  const result = await apiGet<AnalysisReportDto>(`/analysis/reports/${encodeURIComponent(reportId)}`)
  
  // Маппинг reportId -> id для совместимости с типами
  const mappedResult: AnalysisReportDto = {
    ...result,
    id: result.reportId || result.id,
  }
  
  return mappedResult
}

// Отмена анализа
export async function cancelAnalysis(reportId: string): Promise<{ success: boolean; message: string }> {
  validateUUID(reportId, 'reportId')
  
  const result = await apiPost<Record<string, never>, { success: boolean; message: string }>(
    `/analysis/reports/${encodeURIComponent(reportId)}/cancel`,
    {}
  )
  
  return result
}

// Получение уязвимостей проекта
export async function getVulnerabilities(
  projectId: string,
  filters?: VulnerabilityFilters
): Promise<{ vulnerabilities: VulnerabilityDto[]; stats?: Record<string, unknown> }> {
  validateUUID(projectId, 'projectId')
  const searchParams = new URLSearchParams()
  
  if (filters?.severity) {
    searchParams.append('severity', filters.severity)
  }
  if (filters?.filePath) {
    searchParams.append('filePath', filters.filePath)
  }
  if (filters?.type) {
    searchParams.append('type', filters.type)
  }

  const queryString = searchParams.toString()
  const url = `/analysis/projects/${encodeURIComponent(projectId)}/vulnerabilities${
    queryString ? `?${queryString}` : ''
  }`

  return apiGet<{ vulnerabilities: VulnerabilityDto[]; stats?: Record<string, unknown> }>(url)
}

// Объяснение кода
export async function explainCode(
  projectId: string,
  request: ExplainRequestDto
): Promise<CodeExplanationDto> {
  validateUUID(projectId, 'projectId')
  return apiPost<Record<string, unknown>, CodeExplanationDto>(
    `/analysis/projects/${encodeURIComponent(projectId)}/explain`,
    request as Record<string, unknown>
  )
}


// Получение рекомендаций проекта
export async function getRecommendations(
  projectId: string,
  filters?: RecommendationFilters
): Promise<{ recommendations: RecommendationDto[]; stats?: Record<string, unknown> }> {
  validateUUID(projectId, 'projectId')
  const searchParams = new URLSearchParams()
  
  if (filters?.category) {
    searchParams.append('category', filters.category)
  }
  if (filters?.priority) {
    searchParams.append('priority', filters.priority)
  }
  if (filters?.filePath) {
    searchParams.append('filePath', filters.filePath)
  }

  const queryString = searchParams.toString()
  const url = `/analysis/projects/${encodeURIComponent(projectId)}/recommendations${
    queryString ? `?${queryString}` : ''
  }`

  return apiGet<{ recommendations: RecommendationDto[]; stats?: Record<string, unknown> }>(url)
}

// Получение истории анализов проекта
export async function getProjectAnalysisHistory(
  projectId: string,
  filters?: AnalysisHistoryFilters
): Promise<AnalysisHistoryDto> {
  validateUUID(projectId, 'projectId')
  const searchParams = new URLSearchParams()
  
  if (filters?.type) {
    searchParams.append('type', filters.type)
  }
  if (filters?.status) {
    searchParams.append('status', filters.status)
  }
  if (filters?.limit) {
    searchParams.append('limit', filters.limit.toString())
  }
  if (filters?.offset) {
    searchParams.append('offset', filters.offset.toString())
  }

  const queryString = searchParams.toString()
  const url = `/analysis/projects/${encodeURIComponent(projectId)}/reports${
    queryString ? `?${queryString}` : ''
  }`

  return apiGet<AnalysisHistoryDto>(url)
}