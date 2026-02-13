export interface CucumberStep {
  keyword: string
  name: string
  result: {
    status: "passed" | "failed" | "skipped" | "pending" | "undefined"
    duration?: number
    error_message?: string
  }
  line?: number
}

export interface CucumberScenario {
  id: string
  keyword: string
  name: string
  description?: string
  type: string
  tags?: { name: string }[]
  steps: CucumberStep[]
  line?: number
}

export interface CucumberFeature {
  id: string
  keyword: string
  name: string
  description?: string
  uri: string
  tags?: { name: string }[]
  elements: CucumberScenario[]
  line?: number
}

export type CucumberReport = CucumberFeature[]

export interface ReportSummary {
  totalFeatures: number
  totalScenarios: number
  passedScenarios: number
  failedScenarios: number
  skippedScenarios: number
  totalSteps: number
  passedSteps: number
  failedSteps: number
  skippedSteps: number
  totalDuration: number
  passRate: number
  features: FeatureSummary[]
}

export interface FeatureSummary {
  name: string
  uri: string
  totalScenarios: number
  passed: number
  failed: number
  skipped: number
  status: "passed" | "failed"
  duration: number
  scenarios: ScenarioSummary[]
}

export interface ScenarioSummary {
  name: string
  status: "passed" | "failed" | "skipped"
  duration: number
  tags: string[]
  steps: StepSummary[]
  errorMessage?: string
}

export interface StepSummary {
  keyword: string
  name: string
  status: "passed" | "failed" | "skipped" | "pending" | "undefined"
  duration: number
  errorMessage?: string
}
