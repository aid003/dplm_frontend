import { apiFetch, apiGet, apiPost } from '@/shared/lib/api'
import type {
  CreateNodeRequest,
  CreateNodeResponse,
  DeleteNodeResponse,
  DiagnosticsResponse,
  FileContentResponse,
  FileNode,
  FormatRequest,
  FormatResponse,
  LspCompletionRequest,
  LspCompletionResponse,
  LspDefinitionRequest,
  LspDefinitionResponse,
  LspHoverRequest,
  LspHoverResponse,
  SaveContentRequest,
  SaveContentResponse,
  SearchRequest,
  SearchResponse,
} from '@/entities/editor/model/types'

function q(params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) usp.set(key, String(value))
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export async function fetchFileTree(projectId: string, path?: string): Promise<FileNode[]> {
  return apiGet<FileNode[]>(`/projects/${projectId}/files${q({ path })}`)
}

export async function fetchFileContent(projectId: string, path: string): Promise<FileContentResponse> {
  return apiGet<FileContentResponse>(`/projects/${projectId}/files/content${q({ path })}`)
}

export async function saveFileContent(projectId: string, body: SaveContentRequest): Promise<SaveContentResponse> {
  const res = await apiFetch(`/projects/${projectId}/files/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string }).message ?? 'Request failed'
    throw new Error(message)
  }
  return data as SaveContentResponse
}

export async function createNode(projectId: string, body: CreateNodeRequest): Promise<CreateNodeResponse> {
  return apiPost<CreateNodeRequest, CreateNodeResponse>(`/projects/${projectId}/files`, body)
}

export async function deleteNode(projectId: string, path: string): Promise<DeleteNodeResponse> {
  const url = `/projects/${projectId}/files${q({ path })}`
  const res = await apiFetch(url, { method: 'DELETE' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string }).message ?? 'Request failed'
    throw new Error(message)
  }
  return data as DeleteNodeResponse
}

export async function lspCompletion(projectId: string, body: LspCompletionRequest): Promise<LspCompletionResponse> {
  return apiPost<LspCompletionRequest, LspCompletionResponse>(`/projects/${projectId}/lsp/completion`, body)
}

export async function lspHover(projectId: string, body: LspHoverRequest): Promise<LspHoverResponse> {
  return apiPost<LspHoverRequest, LspHoverResponse>(`/projects/${projectId}/lsp/hover`, body)
}

export async function lspDefinition(projectId: string, body: LspDefinitionRequest): Promise<LspDefinitionResponse> {
  return apiPost<LspDefinitionRequest, LspDefinitionResponse>(`/projects/${projectId}/lsp/definition`, body)
}

export async function fetchDiagnostics(projectId: string, path?: string): Promise<DiagnosticsResponse> {
  return apiGet<DiagnosticsResponse>(`/projects/${projectId}/diagnostics${q({ path })}`)
}

export async function formatContent(projectId: string, body: FormatRequest): Promise<FormatResponse> {
  return apiPost<FormatRequest, FormatResponse>(`/projects/${projectId}/format`, body)
}

export async function projectSearch(projectId: string, body: SearchRequest): Promise<SearchResponse> {
  return apiPost<SearchRequest, SearchResponse>(`/projects/${projectId}/search`, body)
}


