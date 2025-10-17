"use client"

import { useEffect, useMemo, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import * as monacoEditor from 'monaco-editor'
import { useTheme } from 'next-themes'
import { useEditorStore } from '@/entities/editor/model/store'
import { formatContent, lspCompletion, lspDefinition, lspHover } from '@/entities/editor/api'

export default function MonacoEditor() {
  const { theme } = useTheme()
  const activePath = useEditorStore((s) => s.activeTabPath)
  const tab = useEditorStore((s) => s.openTabs.find((t) => t.path === s.activeTabPath) ?? null)
  const update = useEditorStore((s) => s.updateTabContent)
  const save = useEditorStore((s) => s.saveFile)
  const diagnostics = useEditorStore((s) => s.diagnostics)
  const projectId = useEditorStore((s) => s.projectId)
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null)

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Ctrl/Cmd+S сохранение
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activePath) void save(activePath)
    })

    // Shift+Alt+F форматирование
    editor.addAction({
      id: 'format-with-backend',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: async () => {
        if (!projectId || !activePath || !tab) return
        const res = await formatContent(projectId, { path: activePath, content: tab.content })
        update(activePath, res.formatted)
      },
    })

    // Completion provider
    monaco.languages.registerCompletionItemProvider('typescript', makeCompletionProvider(monaco))
    monaco.languages.registerCompletionItemProvider('javascript', makeCompletionProvider(monaco))
    monaco.languages.registerCompletionItemProvider('json', makeCompletionProvider(monaco))
    monaco.languages.registerCompletionItemProvider('tsx', makeCompletionProvider(monaco))
    monaco.languages.registerCompletionItemProvider('jsx', makeCompletionProvider(monaco))

    // Hover provider
    monaco.languages.registerHoverProvider('typescript', makeHoverProvider())
    monaco.languages.registerHoverProvider('javascript', makeHoverProvider())
    monaco.languages.registerHoverProvider('json', makeHoverProvider())
    monaco.languages.registerHoverProvider('tsx', makeHoverProvider())
    monaco.languages.registerHoverProvider('jsx', makeHoverProvider())

    // Definition provider
    monaco.languages.registerDefinitionProvider('typescript', makeDefinitionProvider(monaco))
    monaco.languages.registerDefinitionProvider('javascript', makeDefinitionProvider(monaco))
    monaco.languages.registerDefinitionProvider('tsx', makeDefinitionProvider(monaco))
    monaco.languages.registerDefinitionProvider('jsx', makeDefinitionProvider(monaco))
  }

  // Установка маркеров диагностики для текущей модели
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !tab) return
    const monaco = (window as unknown as { monaco?: typeof monacoEditor }).monaco ?? (null as unknown as typeof monacoEditor)
    const model = ed.getModel()
    if (!model) return
    const relevant = diagnostics.filter((d) => d.path === tab.path)
    const markers: monacoEditor.editor.IMarkerData[] = relevant.map((d) => ({
      severity: toMarkerSeverity(d.severity),
      message: d.message,
      code: d.code,
      startLineNumber: d.range.start.line + 1,
      startColumn: d.range.start.character + 1,
      endLineNumber: d.range.end.line + 1,
      endColumn: d.range.end.character + 1,
      source: d.source ?? 'typescript',
    }))
    monacoEditor.editor.setModelMarkers(model, 'owner-ts', markers)
  }, [diagnostics, tab])

  const value = tab?.content ?? ''
  const language = tab?.language ?? 'plaintext'

  // onChange обновляет стор (с авто-сохранением в сторе)
  const handleChange = (v?: string) => {
    if (!activePath || typeof v !== 'string') return
    update(activePath, v)
  }

  return (
    <div className="h-full w-full">
      <Editor
        value={value}
        language={language}
        theme={monacoTheme}
        path={activePath ?? undefined}
        onMount={onMount}
        onChange={handleChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  )

  function toMarkerSeverity(s: 'error' | 'warning' | 'info' | 'hint'): monacoEditor.MarkerSeverity {
    switch (s) {
      case 'error':
        return monacoEditor.MarkerSeverity.Error
      case 'warning':
        return monacoEditor.MarkerSeverity.Warning
      case 'info':
        return monacoEditor.MarkerSeverity.Info
      case 'hint':
        return monacoEditor.MarkerSeverity.Hint
    }
  }

  function makeCompletionProvider(monaco: typeof monacoEditor): monacoEditor.languages.CompletionItemProvider {
    return {
      triggerCharacters: ['.', '"', "'", '/', '@', '<'],
      provideCompletionItems: async (model, position) => {
        if (!projectId || !activePath) return { suggestions: [] }
        try {
          const content = model.getValue()
          const res = await lspCompletion(projectId, {
            path: activePath,
            position: { line: position.lineNumber - 1, character: position.column - 1 },
            content,
          })
          const suggestions: monacoEditor.languages.CompletionItem[] = res.items.map((it, idx) => ({
            label: it.name,
            kind: mapCompletionKind(it.kind),
            sortText: it.sortText ?? String(idx).padStart(4, '0'),
            insertText: it.name,
          }))
          return { suggestions }
        } catch {
          return { suggestions: [] }
        }
      },
    }
  }

  function makeHoverProvider(): monacoEditor.languages.HoverProvider {
    return {
      provideHover: async (model, position) => {
        if (!projectId || !activePath) return { contents: [] }
        try {
          const content = model.getValue()
          const res = await lspHover(projectId, {
            path: activePath,
            position: { line: position.lineNumber - 1, character: position.column - 1 },
            content,
          })
          return { contents: res.contents.map((c) => ({ value: c })) }
        } catch {
          return { contents: [] }
        }
      },
    }
  }

  function makeDefinitionProvider(monaco: typeof monacoEditor): monacoEditor.languages.DefinitionProvider {
    return {
      provideDefinition: async (_model, position) => {
        if (!projectId || !activePath) return []
        try {
          const res = await lspDefinition(projectId, {
            path: activePath,
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          })
          return res.locations.map((loc) => {
            const uri = monaco.Uri.parse(`file://${loc.path}`)
            return {
              uri,
              range: new monaco.Range(
                1,
                loc.textSpan.start + 1,
                1,
                loc.textSpan.start + loc.textSpan.length + 1
              ),
            }
          })
        } catch {
          return []
        }
      },
    }
  }

  function mapCompletionKind(kind: string): monacoEditor.languages.CompletionItemKind {
    switch (kind) {
      case 'method':
        return monacoEditor.languages.CompletionItemKind.Method
      case 'function':
        return monacoEditor.languages.CompletionItemKind.Function
      case 'constructor':
        return monacoEditor.languages.CompletionItemKind.Constructor
      case 'field':
        return monacoEditor.languages.CompletionItemKind.Field
      case 'variable':
        return monacoEditor.languages.CompletionItemKind.Variable
      case 'class':
        return monacoEditor.languages.CompletionItemKind.Class
      case 'interface':
        return monacoEditor.languages.CompletionItemKind.Interface
      case 'module':
        return monacoEditor.languages.CompletionItemKind.Module
      case 'property':
        return monacoEditor.languages.CompletionItemKind.Property
      case 'unit':
        return monacoEditor.languages.CompletionItemKind.Unit
      case 'value':
        return monacoEditor.languages.CompletionItemKind.Value
      case 'enum':
        return monacoEditor.languages.CompletionItemKind.Enum
      case 'keyword':
        return monacoEditor.languages.CompletionItemKind.Keyword
      case 'snippet':
        return monacoEditor.languages.CompletionItemKind.Snippet
      case 'text':
        return monacoEditor.languages.CompletionItemKind.Text
      case 'color':
        return monacoEditor.languages.CompletionItemKind.Color
      case 'file':
        return monacoEditor.languages.CompletionItemKind.File
      case 'reference':
        return monacoEditor.languages.CompletionItemKind.Reference
      case 'folder':
        return monacoEditor.languages.CompletionItemKind.Folder
      case 'enumMember':
        return monacoEditor.languages.CompletionItemKind.EnumMember
      case 'constant':
        return monacoEditor.languages.CompletionItemKind.Constant
      case 'struct':
        return monacoEditor.languages.CompletionItemKind.Struct
      case 'event':
        return monacoEditor.languages.CompletionItemKind.Event
      case 'operator':
        return monacoEditor.languages.CompletionItemKind.Operator
      case 'typeParameter':
        return monacoEditor.languages.CompletionItemKind.TypeParameter
      default:
        return monacoEditor.languages.CompletionItemKind.Property
    }
  }
}


