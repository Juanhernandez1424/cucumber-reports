"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportSummary } from "@/lib/cucumber-types"

interface StepsChartProps {
  summary: ReportSummary
}

export function StepsChart({ summary }: StepsChartProps) {
  const data = summary.features.map((f) => ({
    name: f.name.length > 18 ? f.name.substring(0, 18) + "..." : f.name,
    Exitosos: f.passed,
    Fallidos: f.failed,
    Omitidos: f.skipped,
  }))

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Escenarios por Feature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(240, 4%, 16%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(240, 4%, 16%)" }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240, 6%, 8%)",
                  border: "1px solid hsl(240, 4%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(0, 0%, 95%)",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="Exitosos" fill="hsl(142, 71%, 45%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fallidos" fill="hsl(0, 72%, 51%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Omitidos" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
