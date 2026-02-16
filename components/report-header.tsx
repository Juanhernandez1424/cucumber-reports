"use client"

import { Upload, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportHeaderProps {
  onUpload: (file: File) => void
  hasReport: boolean
}

export function ReportHeader({ onUpload, hasReport }: ReportHeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <header className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FlaskConical className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Cucumber Reports</h1>
          <p className="text-sm text-muted-foreground">
            {hasReport ? "Reporte cargado exitosamente" : "Sube tu archivo JSON para comenzar"}
          </p>
        </div>
      </div>
      <div>
        <label htmlFor="cucumber-upload">
          <Button variant="outline" className="cursor-pointer gap-2" asChild>
            <span>
              <Upload className="h-4 w-4" />
              Subir Reporte JSON
              <input
                id="cucumber-upload"
                type="file"
                accept=".json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </span>
          </Button>
        </label>
      </div>
    </header>
  )
}
