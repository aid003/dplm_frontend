"use client"

import { useAnalysisPage } from '@/widgets/analysis/model/useAnalysisPage'
import { AnalysisHeader } from '@/widgets/analysis/AnalysisHeader'
import { ProjectSelectCard } from '@/widgets/analysis/ProjectSelectCard'
import { AnalysisSettingsCard } from '@/widgets/analysis/AnalysisSettingsCard'
import { AnalysisFlowSection } from '@/widgets/analysis/AnalysisFlowSection'
import { AnalysisCompletedSection } from '@/widgets/analysis/AnalysisCompletedSection'
import { AnalysisDetailsDrawer } from '@/widgets/analysis/AnalysisDetailsDrawer'
import { AnalysisQueryModal } from '@/widgets/analysis/AnalysisQueryModal'

export function AnalysisPage() {
  const {
    projects,
    projectsLoading,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    analysisType,
    setAnalysisType,
    includeTests,
    setIncludeTests,
    languages,
    setLanguages,
    analysisLoading,
    currentReport,
    handleStartAnalysis,
    handleCancelAnalysis,
    handleReset,
    handleRetry,
    projectStats,
    statsLoading,
    viewingDetails,
    handleViewDetails,
    handleCloseDetails,
    // Modal state
    isQueryModalOpen,
    closeQueryModal,
    handleStartWithQuery,
  } = useAnalysisPage()

  return (
    <div className="p-6">
      <AnalysisHeader />

      <div className="mb-6 space-y-4">
        <ProjectSelectCard
          projects={projects}
          loading={projectsLoading}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
          selectedProject={selectedProject}
        />

        {selectedProject && (
          <AnalysisSettingsCard
            analysisType={analysisType}
            onAnalysisTypeChange={setAnalysisType}
            includeTests={includeTests}
            onIncludeTestsChange={setIncludeTests}
            languages={languages}
            onLanguagesChange={setLanguages}
            onStart={handleStartAnalysis}
            onReset={handleReset}
            analysisLoading={analysisLoading}
            selectedProjectId={selectedProjectId}
            currentReport={currentReport}
          />
        )}
      </div>

      <AnalysisFlowSection
        currentReport={currentReport}
        selectedProject={selectedProject}
        analysisLoading={analysisLoading}
        onCancel={() => {
          void handleCancelAnalysis()
        }}
        onRetry={() => {
          void handleRetry()
        }}
      />

      {currentReport && currentReport.status === 'COMPLETED' && (
        <AnalysisCompletedSection
          report={currentReport}
          projectStats={projectStats}
          statsLoading={statsLoading}
          onViewDetails={handleViewDetails}
          isDetailsOpen={Boolean(viewingDetails.type)}
        />
      )}

      {viewingDetails.type && (
        <div className="mt-8">
          <AnalysisDetailsDrawer view={viewingDetails} onClose={handleCloseDetails} />
        </div>
      )}

      <AnalysisQueryModal
        isOpen={isQueryModalOpen}
        onClose={closeQueryModal}
        onStart={handleStartWithQuery}
        onSkip={() => {
          void handleStartWithQuery()
          closeQueryModal()
        }}
        analysisType={analysisType}
      />
    </div>
  )
}
