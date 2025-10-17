export type FileNodeType = 'file' | 'directory'

export interface BaseNode {
  type: FileNodeType
  name: string
  path: string
}

export interface FileLeaf extends BaseNode {
  type: 'file'
  size?: number
}

export interface DirectoryNode extends BaseNode {
  type: 'directory'
  children?: FileNode[]
}

export type FileNode = FileLeaf | DirectoryNode

export type EditorLanguage = 'typescript' | 'javascript' | 'json' | 'tsx' | 'jsx' | 'plaintext'

export interface EditorTab {
  path: string
  content: string
  isDirty: boolean
  language: EditorLanguage
}

export interface Position {
  line: number // 0-based
  character: number // 0-based
}

export interface Range {
  start: Position
  end: Position
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint'

export interface DiagnosticItem {
  path: string
  severity: DiagnosticSeverity
  message: string
  range: Range
  code?: number
  source?: string
}

export interface DiagnosticsResponse {
  diagnostics: DiagnosticItem[]
}

export type TextFileContentResponse = {
  isBinary: false
  content: string
  encoding: 'utf-8'
  size: number
}

export type BinaryFileContentResponse = {
  isBinary: true
  base64: string
  mimeType: string
  size: number
}

export type FileContentResponse = TextFileContentResponse | BinaryFileContentResponse

export interface SaveContentRequest {
  path: string
  content: string
}

export interface SaveContentResponse {
  success: boolean
  updatedAt: string
}

export interface CreateNodeRequest {
  path: string
  type: 'file' | 'directory'
  content?: string
}

export interface CreateNodeResponse {
  success: boolean
  created: FileNode
}

export interface DeleteNodeResponse {
  success: boolean
}

export interface LspCompletionRequest {
  path: string
  position: Position
  content?: string
}

export interface LspCompletionItem {
  name: string
  kind: string
  sortText?: string
}

export interface LspCompletionResponse {
  items: LspCompletionItem[]
}

export interface LspHoverRequest {
  path: string
  position: Position
  content?: string
}

export interface LspHoverResponse {
  contents: string[]
}

export interface LspDefinitionRequest {
  path: string
  position: Position
}

export interface TextSpan {
  start: number
  length: number
}

export interface LspLocation {
  path: string // может быть абсолютным путём на сервере
  textSpan: TextSpan
}

export interface LspDefinitionResponse {
  locations: LspLocation[]
}

export interface FormatRequest {
  path: string
  content: string
}

export interface FormatResponse {
  formatted: string
}

export interface SearchRequest {
  query: string
  caseSensitive: boolean
  regex: boolean
  includePattern?: string
  excludePattern?: string
}

export interface SearchMatch {
  path: string
  line: number
  column: number
  text: string
  preview?: string
}

export interface SearchResponse {
  matches: SearchMatch[]
  total: number
}

export function inferLanguageFromPath(path: string): EditorLanguage {
  const lower = path.toLowerCase()
  if (lower.endsWith('.ts')) return 'typescript'
  if (lower.endsWith('.tsx')) return 'tsx'
  if (lower.endsWith('.js')) return 'javascript'
  if (lower.endsWith('.jsx')) return 'jsx'
  if (lower.endsWith('.json')) return 'json'
  return 'plaintext'
}


