"use client"

import { useState, type RefObject } from "react"
import { Mail, Send, FileImage, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRoot } from "react-dom/client"
import type { ReportSummary } from "@/lib/cucumber-types"
import { FeaturesTable } from "./features-table"
import { generatePDF } from "@/lib/generate-pdf" // Necesitamos crear este helper

interface SendReportDialogProps {
  summary: ReportSummary
  dashboardRef: RefObject<HTMLDivElement | null>
}

type ExportFormat = "pdf" | "image"
type SendStatus = "idle" | "generating" | "sending" | "success" | "error"

export function SendReportDialog({ summary, dashboardRef }: SendReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState(
    `Reporte Cucumber - ${summary.passRate.toFixed(1)}% exitoso - ${new Date().toLocaleDateString("es-MX")}`
  )
  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [status, setStatus] = useState<SendStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const canSend = to.trim().length > 0 && status !== "generating" && status !== "sending"

  const captureAsBase64 = async (): Promise<{ base64: string; fileName: string; fileType: string }> => {
    if (!dashboardRef.current) throw new Error("Dashboard no encontrado")

    const dateSuffix = new Date().toISOString().slice(0, 10)

    if (format === "image") {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.8)
      const base64 = jpegDataUrl.split(",")[1]
      
      return {
        base64,
        fileName: `reporte-cucumber-${dateSuffix}.jpg`,
        fileType: "image",
      }
    } else {
      // Usar la nueva función generatePDF
      const { generatePDF } = await import("@/lib/generate-pdf")
      const pdfBase64 = await generatePDF(dashboardRef.current, summary)
      
      return {
        base64: pdfBase64,
        fileName: `reporte-cucumber-${dateSuffix}.pdf`,
        fileType: "pdf",
      }
    }
  }

  const handleSend = async () => {
    setStatus("generating")
    setErrorMsg("")

    try {
      const { base64, fileName, fileType } = await captureAsBase64()

      setStatus("sending")

      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject,
          summary: {
            totalScenarios: summary.totalScenarios,
            passedScenarios: summary.passedScenarios,
            failedScenarios: summary.failedScenarios,
            skippedScenarios: summary.skippedScenarios,
            passRate: summary.passRate,
            features: summary.features.map((f) => ({
              name: f.name,
              failed: f.failed,
            })),
          },
          fileBase64: base64,
          fileName,
          fileType,
        }),
      })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        const text = await res.text()
        throw new Error(text || `Error del servidor (${res.status})`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar el correo")
      }

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setStatus("idle")
      setErrorMsg("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shrink-0">
          <Mail className="h-4 w-4" />
          Enviar por Correo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Enviar Reporte por Correo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Se envía el reporte completo con dashboard y detalle de features fallidos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Destinatario */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email-to" className="text-sm text-foreground">
              Destinatario
            </Label>
            <Input
              id="email-to"
              type="email"
              placeholder="equipo@empresa.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={status === "generating" || status === "sending"}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Asunto */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email-subject" className="text-sm text-foreground">
              Asunto
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={status === "generating" || status === "sending"}
              className="border-border bg-secondary text-foreground"
            />
          </div>

          {/* Formato */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-foreground">Formato del adjunto</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                disabled={status === "generating" || status === "sending"}
                className={`flex flex-1 items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <FileText className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">PDF</p>
                  <p className="text-xs opacity-70">Con texto seleccionable</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat("image")}
                disabled={status === "generating" || status === "sending"}
                className={`flex flex-1 items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  format === "image"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <FileImage className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Imagen</p>
                  <p className="text-xs opacity-70">Como captura</p>
                </div>
              </button>
            </div>
          </div>

          {/* Status feedback */}
          {status === "success" && (
            <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">Correo enviado exitosamente</p>
                <p className="text-xs text-muted-foreground">
                  El reporte fue enviado a <strong>{to}</strong>.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Error al enviar</p>
                <p className="text-xs text-muted-foreground">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => handleClose(false)} className="text-muted-foreground">
            {status === "success" ? "Cerrar" : "Cancelar"}
          </Button>
          {status !== "success" && (
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando PDF...
                </>
              ) : status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando correo...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Reporte
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}