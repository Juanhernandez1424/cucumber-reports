import type {
  CucumberReport,
  ReportSummary,
  FeatureSummary,
  ScenarioSummary,
  StepSummary,
} from "./cucumber-types"

function getScenarioStatus(scenario: { steps: { result: { status: string } }[] }): "passed" | "failed" | "skipped" {
  const statuses = scenario.steps.map((s) => s.result.status)
  if (statuses.includes("failed")) return "failed"
  if (statuses.every((s) => s === "skipped")) return "skipped"
  return "passed"
}

function getStepDuration(step: { result: { duration?: number } }): number {
  return step.result.duration ? step.result.duration / 1_000_000 : 0 // nanoseconds to ms
}

export function parseCucumberReport(report: CucumberReport): ReportSummary {
  let totalScenarios = 0
  let passedScenarios = 0
  let failedScenarios = 0
  let skippedScenarios = 0
  let totalSteps = 0
  let passedSteps = 0
  let failedSteps = 0
  let skippedSteps = 0
  let totalDuration = 0

  const features: FeatureSummary[] = report.map((feature) => {
    const scenarios: ScenarioSummary[] = (feature.elements || [])
      .filter((el) => el.type === "scenario")
      .map((scenario) => {
        const steps: StepSummary[] = (scenario.steps || []).map((step) => {
          const duration = getStepDuration(step)
          totalDuration += duration
          totalSteps++

          if (step.result.status === "passed") passedSteps++
          else if (step.result.status === "failed") failedSteps++
          else skippedSteps++

          return {
            keyword: step.keyword,
            name: step.name,
            status: step.result.status,
            duration,
            errorMessage: step.result.error_message,
          }
        })

        const status = getScenarioStatus(scenario)
        totalScenarios++
        if (status === "passed") passedScenarios++
        else if (status === "failed") failedScenarios++
        else skippedScenarios++

        const scenarioDuration = steps.reduce((acc, s) => acc + s.duration, 0)
        const failedStep = steps.find((s) => s.status === "failed")

        return {
          name: scenario.name,
          status,
          duration: scenarioDuration,
          tags: (scenario.tags || []).map((t) => t.name),
          steps,
          errorMessage: failedStep?.errorMessage,
        }
      })

    const featurePassed = scenarios.filter((s) => s.status === "passed").length
    const featureFailed = scenarios.filter((s) => s.status === "failed").length
    const featureSkipped = scenarios.filter((s) => s.status === "skipped").length
    const featureDuration = scenarios.reduce((acc, s) => acc + s.duration, 0)

    return {
      name: feature.name,
      uri: feature.uri,
      totalScenarios: scenarios.length,
      passed: featurePassed,
      failed: featureFailed,
      skipped: featureSkipped,
      status: featureFailed > 0 ? "failed" : "passed",
      duration: featureDuration,
      scenarios,
    }
  })

  const passRate = totalScenarios > 0 ? (passedScenarios / totalScenarios) * 100 : 0

  return {
    
    totalFeatures: features.length,
    totalScenarios,
    passedScenarios,
    failedScenarios,
    skippedScenarios,
    totalSteps,
    passedSteps,
    failedSteps,
    skippedSteps,
    totalDuration,
    passRate,
    features,
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = ((ms % 60_000) / 1000).toFixed(0)
  return `${minutes}m ${seconds}s`
}
