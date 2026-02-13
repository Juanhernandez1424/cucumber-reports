"use client"

import { Upload, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onUpload: (file: File) => void
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileJson className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sube tu reporte Cucumber</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Arrastra o selecciona un archivo JSON generado por Cucumber para visualizar los resultados de tus pruebas automatizadas.
          </p>
        </div>
        <label htmlFor="empty-upload" className="cursor-pointer">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <span>
              <Upload className="h-4 w-4" />
              Seleccionar Archivo JSON
              <input
                id="empty-upload"
                type="file"
                accept=".json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground">o usa los datos de ejemplo para explorar</p>
      </div>
    </div>
  )
}
