import { create } from 'zustand'
import type { Project } from './types'
import { listMyProjects, deleteProject as deleteProjectApi } from '@/entities/project/api'

type ProjectsStoreState = {
  projects: Project[]
  loading: boolean
  error?: string
}

type ProjectsStoreActions = {
  fetchProjects: () => Promise<void>
  deleteProjectById: (id: string) => Promise<void>
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
  async deleteProjectById(id: string) {
    // Оптимистично убираем проект из списка
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }))
    try {
      await deleteProjectApi(id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete project'
      // Возвращаем актуальный список с сервера на случай расхождений
      try {
        const items = await listMyProjects()
        set({ projects: items })
      } catch {
        // ignore refetch error here
      }
      set({ error: message })
      throw e
    }
  },
}))


