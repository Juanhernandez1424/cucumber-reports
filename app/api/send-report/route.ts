import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPass) {
      return NextResponse.json(
        {
          error:
            "GMAIL_USER o GMAIL_APP_PASSWORD no estan configuradas. Agregalas en las variables de entorno.",
        },
        { status: 500 }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de la peticion invalido" },
        { status: 400 }
      )
    }

    const { to, subject, summary, fileBase64, fileName, fileType } = body as {
      to: string
      subject: string
      summary: {
        totalScenarios: number
        passedScenarios: number
        failedScenarios: number
        skippedScenarios: number
        passRate: number
        features: { name: string; failed: number }[]
      }
      fileBase64: string
      fileName: string
      fileType: string
    }

    if (!to || !subject || !fileBase64 || !fileName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: to, subject, fileBase64, fileName" },
        { status: 400 }
      )
    }

    // Validate base64 size (cap at 10MB)
    const estimatedSizeBytes = (fileBase64.length * 3) / 4
    const maxSizeMB = 10
    if (estimatedSizeBytes > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `El archivo es demasiado grande (${(estimatedSizeBytes / 1024 / 1024).toFixed(1)}MB). El limite es ${maxSizeMB}MB.`,
        },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(fileBase64, "base64")

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
        <div style="background: #6c3ce0; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Reporte de Pruebas Cucumber</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
            ${new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        
        <div style="background: #f8f8fc; padding: 32px; border: 1px solid #e4e4f0; border-top: none;">
          <h2 style="margin: 0 0 20px; font-size: 16px; color: #333;">Resumen de Ejecucion</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 16px; background: #fff; border: 1px solid #e4e4f0;">
                <div style="font-size: 12px; color: #888;">Total</div>
                <div style="font-size: 24px; font-weight: 700; color: #1a1a2e;">${summary?.totalScenarios ?? "-"}</div>
              </td>
              <td style="padding: 12px 16px; background: #fff; border: 1px solid #e4e4f0;">
                <div style="font-size: 12px; color: #888;">Exitosos</div>
                <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${summary?.passedScenarios ?? "-"}</div>
              </td>
              <td style="padding: 12px 16px; background: #fff; border: 1px solid #e4e4f0;">
                <div style="font-size: 12px; color: #888;">Fallidos</div>
                <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${summary?.failedScenarios ?? "-"}</div>
              </td>
              <td style="padding: 12px 16px; background: #fff; border: 1px solid #e4e4f0;">
                <div style="font-size: 12px; color: #888;">Tasa</div>
                <div style="font-size: 24px; font-weight: 700; color: #6c3ce0;">${summary?.passRate?.toFixed(1) ?? "-"}%</div>
              </td>
            </tr>
          </table>

          ${
            summary?.failedScenarios > 0
              ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #dc2626;">Features con Fallos</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #991b1b; line-height: 1.8;">
              ${(summary.features ?? [])
                .filter((f: { failed: number }) => f.failed > 0)
                .map(
                  (f: { name: string; failed: number }) =>
                    `<li><strong>${f.name}</strong> - ${f.failed} fallido(s)</li>`
                )
                .join("")}
            </ul>
          </div>
          `
              : ""
          }

          <p style="font-size: 13px; color: #666; margin: 0;">
            El reporte visual completo se encuentra adjunto como archivo <strong>${fileName}</strong>.
          </p>
        </div>
        
        <div style="background: #f0f0f8; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e4e4f0; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
            Generado automaticamente desde Cucumber Reports Dashboard
          </p>
        </div>
      </div>
    `

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg"

    const info = await transporter.sendMail({
      from: `Cucumber Reports <${gmailUser}>`,
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: buffer,
          contentType: mimeType,
        },
      ],
    })

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error("[send-report] Error:", err)
    const message =
      err instanceof Error ? err.message : "Error interno al enviar el correo"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
