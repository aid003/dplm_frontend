import { apiGet, apiPostFormData } from '@/shared/lib/api'
import type { Project, UploadProgressResponse } from '@/entities/project/model/types'

export async function listMyProjects(): Promise<Project[]> {
  return apiGet<Project[]>('/projects')
}

export async function createProject(formData: FormData): Promise<Project> {
  return apiPostFormData<Project>('/projects', formData)
}

export async function getUploadProgress(jobId: string): Promise<UploadProgressResponse> {
  return apiGet<UploadProgressResponse>(`/uploads/progress/${encodeURIComponent(jobId)}`)
}


