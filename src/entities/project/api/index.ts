import { apiGet, apiPostFormData, subscribeSse } from '@/shared/lib/api'
import type { Project, UploadProgressResponse, SseProgressEvent } from '@/entities/project/model/types'
import { apiFetch } from '@/shared/lib/api'

export async function listMyProjects(): Promise<Project[]> {
  return apiGet<Project[]>('/projects')
}

export async function createProject(formData: FormData): Promise<Project> {
  return apiPostFormData<Project>('/projects', formData)
}

export async function getUploadProgress(jobId: string): Promise<UploadProgressResponse> {
  return apiGet<UploadProgressResponse>(`/uploads/progress/${encodeURIComponent(jobId)}`)
}

// Подписка на прогресс через SSE
export function subscribeToUploadProgress(
  jobId: string,
  handlers: {
    onEvent: (event: SseProgressEvent) => void
    onError?: (e: Error) => void
    onDone?: () => void
  },
): () => void {
  return subscribeSse<SseProgressEvent>(
    `/uploads/progress/${encodeURIComponent(jobId)}`,
    handlers.onEvent,
    handlers.onError,
    handlers.onDone,
  )
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await apiFetch(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
  if (res.status === 204) return
  const text = await res.text().catch(() => '')
  throw new Error(text || `Failed to delete project: ${res.status}`)
}


