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
  progress: number
}


