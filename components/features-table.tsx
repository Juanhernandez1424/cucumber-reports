"use client"

import { Fragment, useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, SkipForward, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FeatureSummary } from "@/lib/cucumber-types"
import { formatDuration } from "@/lib/parse-cucumber"
import { ScenarioDetail } from "./scenario-detail"

interface FeaturesTableProps {
  features: FeatureSummary[]
}

export function FeaturesTable({ features }: FeaturesTableProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const toggleFeature = (name: string) => {
    setExpandedFeature(expandedFeature === name ? null : name)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">Detalle por Feature</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-8 text-muted-foreground" />
              <TableHead className="text-muted-foreground">Feature</TableHead>
              <TableHead className="text-center text-muted-foreground">Total</TableHead>
              <TableHead className="text-center text-muted-foreground">Exitosos</TableHead>
              <TableHead className="text-center text-muted-foreground">Fallidos</TableHead>
              <TableHead className="text-center text-muted-foreground">Omitidos</TableHead>
              <TableHead className="text-right text-muted-foreground">Duracion</TableHead>
              <TableHead className="text-center text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <Fragment key={feature.name}>
                <TableRow
                  className="cursor-pointer border-border transition-colors hover:bg-secondary/50"
                  onClick={() => toggleFeature(feature.name)}
                >
                  <TableCell className="w-8 text-muted-foreground">
                    {expandedFeature === feature.name ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{feature.name}</TableCell>
                  <TableCell className="text-center font-mono text-foreground">{feature.totalScenarios}</TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 font-mono text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {feature.passed}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 font-mono text-destructive">
                      <XCircle className="h-3.5 w-3.5" />
                      {feature.failed}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 font-mono text-warning">
                      <SkipForward className="h-3.5 w-3.5" />
                      {feature.skipped}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatDuration(feature.duration)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={feature.status === "passed" ? "default" : "destructive"}
                      className={
                        feature.status === "passed"
                          ? "bg-success/15 text-success hover:bg-success/20"
                          : "bg-destructive/15 text-destructive hover:bg-destructive/20"
                      }
                    >
                      {feature.status === "passed" ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                </TableRow>
                {expandedFeature === feature.name && (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={8} className="p-0">
                      <div className="border-t border-border bg-secondary/30 px-6 py-4">
                        <ScenarioDetail scenarios={feature.scenarios} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
