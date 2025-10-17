type PageProps = { params: { projectId: string } }

export default function Page({ params }: PageProps) {
  const { projectId } = params
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Редактор кода</h1>
      <p className="text-sm text-muted-foreground mt-2">Заглушка. Проект: {projectId}</p>
    </div>
  )
}


