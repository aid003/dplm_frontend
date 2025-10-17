type PageParams = { projectId: string }
type PageProps = { params: Promise<PageParams> }

import CodeEditor from '@/widgets/code-editor/CodeEditor'

export default async function Page({ params }: PageProps) {
  const { projectId } = await params
  return (
    <div className="p-2">
      <CodeEditor projectId={projectId} />
    </div>
  )
}


