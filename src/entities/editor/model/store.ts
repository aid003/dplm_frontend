import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DiagnosticItem,
  EditorLanguage,
  EditorTab,
  FileNode,
} from '@/entities/editor/model/types'
import {
  fetchDiagnostics,
  fetchFileContent,
  fetchFileTree,
  saveFileContent,
} from '@/entities/editor/api'
import { inferLanguageFromPath } from '@/entities/editor/model/types'

type EditorState = {
  projectId: string | null
  fileTree: FileNode[]
  openTabs: EditorTab[]
  activeTabPath: string | null
  diagnostics: DiagnosticItem[]
  setProjectId: (projectId: string) => void
  loadFileTree: (path?: string) => Promise<void>
  openFile: (path: string) => Promise<void>
  closeTab: (path: string) => void
  setActiveTab: (path: string) => void
  updateTabContent: (path: string, content: string) => void
  saveFile: (path: string) => Promise<void>
  refreshDiagnostics: (path?: string) => Promise<void>
}

const saveTimers: Record<string, number | undefined> = {}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      projectId: null,
      fileTree: [],
      openTabs: [],
      activeTabPath: null,
      diagnostics: [],

      setProjectId: (projectId) => set({ projectId }),

      loadFileTree: async (path) => {
        const pid = get().projectId
        if (!pid) return
        const tree = await fetchFileTree(pid, path)
        set({ fileTree: path ? mergeIntoTree(get().fileTree, path, tree) : tree })
      },

      openFile: async (path) => {
        const pid = get().projectId
        if (!pid) return
        const exists = get().openTabs.some((t) => t.path === path)
        if (!exists) {
          const fileResponse = await fetchFileContent(pid, path)
          if (fileResponse.isBinary) {
            // Для бинарных файлов инициируем скачивание и не открываем вкладку
            triggerBinaryDownload(path, fileResponse.mimeType, fileResponse.base64)
          } else {
            const language: EditorLanguage = inferLanguageFromPath(path)
            const tab: EditorTab = { path, content: fileResponse.content, isDirty: false, language }
            set({ openTabs: [...get().openTabs, tab], activeTabPath: path })
          }
        } else {
          set({ activeTabPath: path })
        }
        void get().refreshDiagnostics(path)
      },

      closeTab: (path) => {
        const rest = get().openTabs.filter((t) => t.path !== path)
        const isActive = get().activeTabPath === path
        set({ openTabs: rest, activeTabPath: isActive ? (rest[0]?.path ?? null) : get().activeTabPath })
      },

      setActiveTab: (path) => set({ activeTabPath: path }),

      updateTabContent: (path, content) => {
        set({
          openTabs: get().openTabs.map((t) => (t.path === path ? { ...t, content, isDirty: true } : t)),
        })
        const prev = saveTimers[path]
        if (prev) window.clearTimeout(prev)
        saveTimers[path] = window.setTimeout(() => {
          void get().saveFile(path)
        }, 800)
      },

      saveFile: async (path) => {
        const pid = get().projectId
        if (!pid) return
        const tab = get().openTabs.find((t) => t.path === path)
        if (!tab) return
        await saveFileContent(pid, { path, content: tab.content })
        set({ openTabs: get().openTabs.map((t) => (t.path === path ? { ...t, isDirty: false } : t)) })
        void get().refreshDiagnostics(path)
      },

      refreshDiagnostics: async (path) => {
        const pid = get().projectId
        if (!pid) return
        try {
          const d = await fetchDiagnostics(pid, path)
          set({ diagnostics: d.diagnostics })
        } catch (e) {
          // Игнорируем ошибки диагностики, напр. "File not part of the program"
          // чтобы не прерывать работу редактора
        }
      },
    }),
    { name: 'editor-state' }
  )
)

function mergeIntoTree(root: FileNode[], targetPath: string | undefined, nodes: FileNode[]): FileNode[] {
  if (!targetPath) return nodes
  const parts = targetPath.split('/')
  function rec(cur: FileNode[], idx: number): FileNode[] {
    if (idx >= parts.length) return nodes
    const name = parts[idx]
    return cur.map((n) => {
      if (n.type === 'directory' && n.name === name) {
        const children = Array.isArray(n.children) ? rec(n.children, idx + 1) : rec([], idx + 1)
        return { ...n, children }
      }
      return n
    })
  }
  return rec(root, 0)
}

function triggerBinaryDownload(path: string, mimeType: string, base64: string): void {
  const fileName = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path
  const dataUrl = `data:${mimeType};base64,${base64}`
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}


