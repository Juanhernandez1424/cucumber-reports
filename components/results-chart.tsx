"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportSummary } from "@/lib/cucumber-types"

interface ResultsChartProps {
  summary: ReportSummary
}

const COLORS = {
  passed: "hsl(142, 71%, 45%)",
  failed: "hsl(0, 72%, 51%)",
  skipped: "hsl(38, 92%, 50%)",
}

export function ResultsChart({ summary }: ResultsChartProps) {
  const data = [
    { name: "Exitosos", value: summary.passedScenarios, color: COLORS.passed },
    { name: "Fallidos", value: summary.failedScenarios, color: COLORS.failed },
    { name: "Omitidos", value: summary.skippedScenarios, color: COLORS.skipped },
  ].filter((d) => d.value > 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Distribucion de Escenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(240, 6%, 8%)",
                    border: "1px solid hsl(240, 4%, 16%)",
                    borderRadius: "8px",
                    color: "hsl(0, 0%, 95%)",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-mono text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
