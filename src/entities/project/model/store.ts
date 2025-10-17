import { create } from 'zustand'
import type { Project } from './types'
import { listMyProjects } from '@/entities/project/api'

type ProjectsStoreState = {
  projects: Project[]
  loading: boolean
  error?: string
}

type ProjectsStoreActions = {
  fetchProjects: () => Promise<void>
}

export const useProjectsStore = create<ProjectsStoreState & ProjectsStoreActions>((set) => ({
  projects: [],
  loading: false,
  error: undefined,
  async fetchProjects() {
    set({ loading: true, error: undefined })
    try {
      const items = await listMyProjects()
      set({ projects: items, loading: false })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load projects'
      set({ error: message, loading: false })
    }
  },
}))


