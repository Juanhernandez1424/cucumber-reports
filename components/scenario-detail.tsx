"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, SkipForward, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ScenarioSummary } from "@/lib/cucumber-types"
import { formatDuration } from "@/lib/parse-cucumber"

interface ScenarioDetailProps {
  scenarios: ScenarioSummary[]
}

function StatusIcon({ status }: { status: string }) {
  if (status === "passed") return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
  if (status === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />
  return <SkipForward className="h-3.5 w-3.5 text-warning" />
}

export function ScenarioDetail({ scenarios }: ScenarioDetailProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {scenarios.map((scenario) => (
        <div
          key={scenario.name}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
            onClick={() =>
              setExpandedScenario(expandedScenario === scenario.name ? null : scenario.name)
            }
          >
            {expandedScenario === scenario.name ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <StatusIcon status={scenario.status} />
            <span className="flex-1 text-sm font-medium text-foreground">{scenario.name}</span>
            <div className="flex items-center gap-2">
              {scenario.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-border text-xs text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
              <span className="font-mono text-xs text-muted-foreground">
                {formatDuration(scenario.duration)}
              </span>
            </div>
          </button>

          {expandedScenario === scenario.name && (
            <div className="border-t border-border px-4 py-3">
              <div className="flex flex-col gap-1.5">
                {scenario.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-md px-3 py-1.5 text-sm"
                  >
                    <StatusIcon status={step.status} />
                    <span className="font-mono text-xs font-semibold text-primary">
                      {step.keyword}
                    </span>
                    <span className="flex-1 text-foreground">{step.name}</span>
                    {step.duration > 0 && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDuration(step.duration)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {scenario.errorMessage && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <pre className="flex-1 whitespace-pre-wrap break-all font-mono text-xs text-destructive">
                    {scenario.errorMessage}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
