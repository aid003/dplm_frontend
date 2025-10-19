// Типы анализа на основе OpenAPI схемы бэкенда

export type AnalysisType = 'VULNERABILITY' | 'EXPLANATION' | 'RECOMMENDATION' | 'FULL'

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface AnalysisOptionsDto {
  includeTests?: boolean
  languages?: string[]
}

export interface AnalysisRequestDto extends Record<string, unknown> {
  type: AnalysisType
  query?: string
  filePath?: string
  options?: AnalysisOptionsDto
}

export interface ExplainRequestDto extends Record<string, unknown> {
  filePath: string
  lineStart?: number
  lineEnd?: number
  symbolName?: string
}

export interface VulnerabilityDto {
  id: string
  severity?: VulnerabilitySeverity
  type?: string
  title: string
  description: string
  filePath: string
  lineStart: number
  lineEnd: number
  codeSnippet: string
  recommendation?: string
  cwe?: string
  createdAt?: string
  // Дополнительные поля для совместимости с реальным API
  impact?: string
  category?: string
  priority?: string
  suggestion?: string
}

export interface CodeExplanationDto {
  id: string
  filePath: string
  symbolName?: string
  symbolType?: string
  lineStart: number
  lineEnd: number
  summary: string
  detailed: string
  complexity?: number
  createdAt: string
}

export interface RecommendationDto {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  impact: string
  suggestion: string
  filePath: string
  lineStart: number
  lineEnd?: number
  codeSnippet?: string
  createdAt: string
}

export interface AnalysisResultDto {
  vulnerabilities?: VulnerabilityDto[]
  explanations?: CodeExplanationDto[]
  recommendations?: (string | RecommendationDto)[]
  // Дополнительные поля для совместимости с реальным API
  filesScanned?: number
  totalScanTime?: number
  vulnerabilitiesFound?: number
}

export interface AnalysisProgressDto {
  currentStep: string
  percentage: number
  processedFiles: number
  totalFiles: number
  currentFile?: string
}

export interface AnalysisReportDto {
  id: string
  reportId?: string // Дополнительное поле для совместимости с API
  projectId: string
  type: AnalysisType
  status: AnalysisStatus
  filePath?: string
  language?: string
  result?: AnalysisResultDto
  error?: string
  progress?: AnalysisProgressDto
  createdAt: string
  updatedAt: string
}

export interface AnalysisStatusDto {
  id: string
  reportId?: string // Дополнительное поле для совместимости с API
  status: AnalysisStatus
  progress?: AnalysisProgressDto
  startedAt: string
  estimatedTimeRemaining?: number
}

export interface AnalysisHistoryDto {
  reports: AnalysisReportDto[]
  total: number
  stats?: Record<string, unknown>
}

// Фильтры для запросов
export interface VulnerabilityFilters {
  severity?: VulnerabilitySeverity
  filePath?: string
  type?: string
}

export interface ExplanationFilters {
  filePath?: string
  symbolType?: string
  symbolName?: string
}

export interface RecommendationFilters {
  category?: string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  filePath?: string
}

export interface AnalysisHistoryFilters {
  type?: AnalysisType
  status?: AnalysisStatus
  limit?: number
  offset?: number
}

// Состояние store
export interface AnalysisStoreState {
  currentReport: AnalysisReportDto | null
  status: AnalysisStatus | null
  loading: boolean
  error: string | null
  pollingIntervalId: NodeJS.Timeout | null
}

export interface AnalysisStoreActions {
  startAnalysis: (projectId: string, request: AnalysisRequestDto) => Promise<void>
  pollStatus: (reportId: string) => Promise<void>
  stopPolling: () => void
  cancelAnalysis: (reportId: string) => Promise<void>
  fetchResults: (reportId: string) => Promise<void>
  reset: () => void
  setError: (error: string | null) => void
}
