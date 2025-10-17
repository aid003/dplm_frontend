"use client"
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useEditorStore } from '@/entities/editor/model/store'

export default function TabBar() {
  const tabs = useEditorStore((s) => s.openTabs)
  const active = useEditorStore((s) => s.activeTabPath)
  const setActive = useEditorStore((s) => s.setActiveTab)
  const closeTab = useEditorStore((s) => s.closeTab)

  return (
    <div className="flex items-center gap-1 border-b px-2 h-9">
      {tabs.map((t) => (
        <button
          key={t.path}
          className={cn(
            'group flex items-center gap-2 rounded px-2 h-7 text-xs',
            active === t.path ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
          )}
          onClick={() => setActive(t.path)}
        >
          <span className="truncate max-w-[200px]">
            {t.path.split('/').pop()} {t.isDirty ? '•' : ''}
          </span>
          <X
            className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(t.path)
            }}
          />
        </button>
      ))}
    </div>
  )
}


