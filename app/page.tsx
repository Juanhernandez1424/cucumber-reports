"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ReportHeader } from "@/components/report-header"
import { StatsCards } from "@/components/stats-cards"
import { ResultsChart } from "@/components/results-chart"
import { StepsChart } from "@/components/steps-chart"
import { FeaturesTable } from "@/components/features-table"
import { EmptyState } from "@/components/empty-state"
import { parseCucumberReport } from "@/lib/parse-cucumber"
import { sampleReport } from "@/lib/sample-data"
import type { ReportSummary } from "@/lib/cucumber-types"
import { FlaskConical } from "lucide-react"

export default function CucumberDashboard() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback((file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const parsed = parseCucumberReport(json)
        setSummary(parsed)
      } catch {
        setError("El archivo no es un reporte Cucumber JSON valido.")
      }
    }
    reader.readAsText(file)
  }, [])

  const loadSample = useCallback(() => {
    const parsed = parseCucumberReport(sampleReport)
    setSummary(parsed)
  }, [])

  if (!summary) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ReportHeader onUpload={handleUpload} hasReport={false} />
        <EmptyState onUpload={handleUpload} />
        <div className="flex justify-center pb-8">
          <Button
            variant="outline"
            onClick={loadSample}
            className="gap-2"
          >
            <FlaskConical className="h-4 w-4" />
            Cargar Datos de Ejemplo
          </Button>
        </div>
        {error && (
          <div className="mx-auto mt-4 max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <ReportHeader onUpload={handleUpload} hasReport={true} />
        <StatsCards summary={summary} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResultsChart summary={summary} />
          <StepsChart summary={summary} />
        </div>
        <FeaturesTable features={summary.features} />
      </div>
    </main>
  )
}
