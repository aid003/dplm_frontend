"use client"
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, File as FileIcon, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { FileNode } from '@/entities/editor/model/types'
import { useEditorStore } from '@/entities/editor/model/store'
import { createNode, deleteNode, fetchFileTree } from '@/entities/editor/api'

type TreeProps = {
  root?: FileNode[]
}

export function FileTree({ root }: TreeProps) {
  const projectId = useEditorStore((s) => s.projectId)
  const fileTree = useEditorStore((s) => s.fileTree)
  const loadFileTree = useEditorStore((s) => s.loadFileTree)
  const openFile = useEditorStore((s) => s.openFile)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!root && fileTree.length === 0) void loadFileTree()
  }, [fileTree.length, loadFileTree, root])

  const nodes = root ?? fileTree

  async function toggleDir(path: string): Promise<void> {
    const next = !expanded[path]
    setExpanded((e) => ({ ...e, [path]: next }))
    if (next) {
      await loadFileTree(path)
    }
  }

  async function onCreate(path: string, type: 'file' | 'directory'): Promise<void> {
    if (!projectId) return
    const name = window.prompt(`Название для ${type === 'file' ? 'файла' : 'папки'}`)
    if (!name) return
    const full = path ? `${path}/${name}` : name
    await createNode(projectId, { path: full, type })
    await loadFileTree(path)
  }

  async function onDelete(path: string): Promise<void> {
    if (!projectId) return
    if (!window.confirm(`Удалить ${path}?`)) return
    await deleteNode(projectId, path)
    const parent = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : undefined
    await loadFileTree(parent)
  }

  return (
    <div className="text-sm select-none">
      <TreeLevel nodes={nodes} expanded={expanded} onToggle={toggleDir} onOpenFile={openFile} onCreate={onCreate} onDelete={onDelete} />
    </div>
  )
}

type LevelProps = {
  nodes: FileNode[]
  expanded: Record<string, boolean>
  onToggle: (path: string) => void | Promise<void>
  onOpenFile: (path: string) => void | Promise<void>
  onCreate: (path: string, type: 'file' | 'directory') => void | Promise<void>
  onDelete: (path: string) => void | Promise<void>
}

function TreeLevel({ nodes, expanded, onToggle, onOpenFile, onCreate, onDelete }: LevelProps) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((n) => (
        <li key={n.path} className="group">
          {n.type === 'directory' ? (
            <div className="flex items-center gap-1">
              <button className="px-1" onClick={() => onToggle(n.path)} aria-label="toggle">
                {expanded[n.path] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expanded[n.path] ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
              <span className="ml-1 truncate">{n.name}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => onCreate(n.path, 'file')} aria-label="new file">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onCreate(n.path, 'directory')} aria-label="new folder">
                  <Folder className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(n.path)} aria-label="delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 rounded px-1 py-0.5"
              onClick={() => onOpenFile(n.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  void onOpenFile(n.path)
                }
              }}
            >
              <FileIcon className="h-4 w-4" />
              <span className="truncate">{n.name}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition flex gap-1">
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); void onDelete(n.path) }} aria-label="delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {n.type === 'directory' && expanded[n.path] && Array.isArray(n.children) && (
            <div className="ml-5">
              <TreeLevel nodes={n.children} expanded={expanded} onToggle={onToggle} onOpenFile={onOpenFile} onCreate={onCreate} onDelete={onDelete} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default FileTree


