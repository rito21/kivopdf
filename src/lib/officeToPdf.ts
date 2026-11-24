import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProcessResult } from "./pdfProcessor";
import type { ProgressCallback } from "./qpdfProcessor";

function sanitizeWinAnsi(text: string): string {
  return text.replace(/[^\x20-\x7E\u00A0-\u00FF\n\t]/g, " ");
}

function wrapLines(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const words = rawLine.split(/\s+/);
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length > maxChars) {
        if (current) out.push(current);
        current = w;
      } else {
        current = current ? `${current} ${w}` : w;
      }
    }
    out.push(current);
  }
  return out;
}

export async function wordToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Leyendo documento Word (.docx)...", 25);
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer });

  onProgress?.("Generando páginas PDF...", 70);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = wrapLines(sanitizeWinAnsi(rawText || "(Documento vacío)"), 86);

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 50;
  const lineH = 16;
  const maxLinesPerPage = Math.floor((pageH - margin * 2) / lineH);

  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const page = doc.addPage([pageW, pageH]);
    const slice = lines.slice(i, i + maxLinesPerPage);
    slice.forEach((line, idx) => {
      if (line.trim()) {
        page.drawText(line, {
          x: margin,
          y: pageH - margin - idx * lineH,
          size: 11,
          font,
          color: rgb(0.1, 0.12, 0.16),
        });
      }
    });
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `${file.name.replace(/\.(docx?|DOCX?)$/, "")}.pdf`,
    details: `Convertido a PDF (${doc.getPageCount()} páginas) en tu navegador.`,
  };
}

export async function excelToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Leyendo hoja de cálculo Excel...", 25);
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  onProgress?.("Maquetando tablas en PDF...", 70);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageW = 841.89; // A4 landscape for wide tables
  const pageH = 595.28;
  const margin = 40;
  const lineH = 15;
  const maxLines = Math.floor((pageH - margin * 2 - 24) / lineH);

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
    const formattedRows = rows.map((r) =>
      sanitizeWinAnsi((r || []).map((c) => String(c ?? "")).join("  |  ")).slice(0, 125)
    );

    if (formattedRows.length === 0) formattedRows.push("(Hoja vacía)");

    for (let i = 0; i < formattedRows.length; i += maxLines) {
      const page = doc.addPage([pageW, pageH]);
      page.drawText(sanitizeWinAnsi(`Hoja: ${sheetName}`), {
        x: margin,
        y: pageH - margin,
        size: 13,
        font: boldFont,
        color: rgb(0.06, 0.09, 0.16),
      });

      formattedRows.slice(i, i + maxLines).forEach((rowText, idx) => {
        if (rowText.trim()) {
          page.drawText(rowText, {
            x: margin,
            y: pageH - margin - 24 - idx * lineH,
            size: 9.5,
            font,
            color: rgb(0.15, 0.18, 0.24),
          });
        }
      });
    }
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `${file.name.replace(/\.(xlsx?|csv|XLSX?|CSV)$/, "")}.pdf`,
    details: `${wb.SheetNames.length} hoja(s) convertida(s) a PDF (${doc.getPageCount()} páginas).`,
  };
}
