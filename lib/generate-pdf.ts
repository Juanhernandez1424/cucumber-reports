import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportSummary } from "./cucumber-types";

export async function generatePDF(dashboardElement: HTMLElement, summary: ReportSummary): Promise<string> {
  // Crear nuevo PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Título
  pdf.setFontSize(20);
  pdf.setTextColor(108, 60, 224); // #6c3ce0
  pdf.text("Reporte de Pruebas Cucumber", 20, 20);
  
  // Fecha
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(`Generado el ${dateStr}`, 20, 30);

  // Resumen de estadísticas
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Resumen de Ejecución", 20, 45);

  // Tabla de resumen
  autoTable(pdf, {
    startY: 50,
    head: [["Total", "Exitosos", "Fallidos", "Omitidos", "Tasa de Éxito"]],
    body: [[
      summary.totalScenarios.toString(),
      summary.passedScenarios.toString(),
      summary.failedScenarios.toString(),
      summary.skippedScenarios.toString(),
      `${summary.passRate.toFixed(1)}%`,
    ]],
    theme: "grid",
    headStyles: { fillColor: [108, 60, 224] },
    styles: { halign: "center" },
  });

  // Features fallidos
  const failedFeatures = summary.features.filter(f => f.failed > 0);
  
  if (failedFeatures.length > 0) {
    pdf.setFontSize(14);
    pdf.text("Detalle de Features Fallidos", 20, (pdf as any).lastAutoTable.finalY + 15);

    let yOffset = (pdf as any).lastAutoTable.finalY + 25;

    failedFeatures.forEach((feature) => {
      // Verificar si necesitamos nueva página
      if (yOffset > 250) {
        pdf.addPage();
        yOffset = 20;
      }

      // Nombre del feature
      pdf.setFontSize(12);
      pdf.setTextColor(239, 68, 68); // #ef4444
      pdf.text(feature.name, 20, yOffset);
      yOffset += 7;

      // Estadísticas del feature
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Total: ${feature.totalScenarios} | Exitosos: ${feature.passed} | Fallidos: ${feature.failed} | Omitidos: ${feature.skipped}`,
        25,
        yOffset
      );
      yOffset += 10;

      // Escenarios fallidos
      const failedScenarios = feature.scenarios?.filter(s => s.status === "failed") || [];
      
      failedScenarios.forEach((scenario) => {
        // Verificar espacio
        if (yOffset > 260) {
          pdf.addPage();
          yOffset = 20;
        }

        // Nombre del escenario
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`• ${scenario.name}`, 30, yOffset);
        yOffset += 6;

        // Steps fallidos con errores
        const failedSteps = scenario.steps?.filter(step => step.status === "failed") || [];
        
        failedSteps.forEach((step) => {
          // Verificar espacio
          if (yOffset > 260) {
            pdf.addPage();
            yOffset = 20;
          }

          pdf.setFontSize(9);
          pdf.setTextColor(239, 68, 68);
          pdf.text(`  ${step.keyword}${step.name}`, 35, yOffset);
          yOffset += 5;

          // Mensaje de error
          if (step.errorMessage) {
            if (yOffset > 260) {
              pdf.addPage();
              yOffset = 20;
            }

            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            
            // Dividir error en líneas
            const errorLines = pdf.splitTextToSize(step.errorMessage, 130);
            errorLines.forEach((line: string) => {
              if (yOffset > 260) {
                pdf.addPage();
                yOffset = 20;
              }
              pdf.text(`    ${line}`, 40, yOffset);
              yOffset += 4;
            });
            yOffset += 2;
          }
        });
        yOffset += 5;
      });
      yOffset += 10;
    });
  }

  // Convertir a base64
  return pdf.output('datauristring').split(',')[1];
}