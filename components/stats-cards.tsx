"use client"

import { CheckCircle2, XCircle, SkipForward, Layers, Clock, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ReportSummary } from "@/lib/cucumber-types"
import { formatDuration } from "@/lib/parse-cucumber"

interface StatsCardsProps {
  summary: ReportSummary
}

export function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Escenarios",
      value: summary.totalScenarios,
      icon: Layers,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Exitosos",
      value: summary.passedScenarios,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Fallidos",
      value: summary.failedScenarios,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Omitidos",
      value: summary.skippedScenarios,
      icon: SkipForward,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Tasa de Exito",
      value: `${summary.passRate.toFixed(1)}%`,
      icon: BarChart3,
      color: summary.passRate >= 80 ? "text-success" : summary.passRate >= 50 ? "text-warning" : "text-destructive",
      bg: summary.passRate >= 80 ? "bg-success/10" : summary.passRate >= 50 ? "bg-warning/10" : "bg-destructive/10",
    },
    {
      label: "Duracion Total",
      value: formatDuration(summary.totalDuration),
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
