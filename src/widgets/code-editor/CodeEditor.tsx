"use client"

import { useEffect } from 'react'
import TabBar from '@/entities/editor/ui/TabBar'
import FileTree from '@/entities/editor/ui/FileTree'
import MonacoEditor from '@/entities/editor/ui/MonacoEditor'
import { useEditorStore } from '@/entities/editor/model/store'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/components/ui/resizable'

type Props = { projectId: string }

export default function CodeEditor({ projectId }: Props) {
  const setProjectId = useEditorStore((s) => s.setProjectId)
  const loadTree = useEditorStore((s) => s.loadFileTree)

  useEffect(() => {
    setProjectId(projectId)
    void loadTree()
  }, [loadTree, projectId, setProjectId])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <TabBar />
      <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={24} minSize={16}>
          <div className="h-full border-r p-2 overflow-auto">
            <FileTree />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={76} minSize={40}>
          <div className="h-full min-w-0">
            <MonacoEditor />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}


