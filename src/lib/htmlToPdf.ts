import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProcessResult } from "./pdfProcessor";

function sanitizeWinAnsi(text: string): string {
  return text.replace(/[^\x20-\x7E\u00A0-\u00FF\n\t]/g, " ");
}

export async function htmlToPdf(
  htmlInput: string,
  filename = "pagina_web.pdf"
): Promise<ProcessResult> {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(htmlInput, "text/html");
  parsed.querySelectorAll("script, style, noscript").forEach((el) => el.remove());

  const title = parsed.title?.trim() || "Documento HTML";
  const rawText = (parsed.body?.innerText || parsed.body?.textContent || htmlInput).trim();

  const lines: string[] = [];
  for (const rawLine of sanitizeWinAnsi(rawText).split(/\r?\n/)) {
    const words = rawLine.trim().split(/\s+/);
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > 86) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = cur ? `${cur} ${w}` : w;
      }
    }
    if (cur) lines.push(cur);
  }
  if (lines.length === 0) lines.push("(Contenido HTML vacío)");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 50;
  const lineH = 16;
  const maxLines = Math.floor((pageH - margin * 2 - 28) / lineH);

  for (let i = 0; i < lines.length; i += maxLines) {
    const page = doc.addPage([pageW, pageH]);
    if (i === 0) {
      page.drawText(sanitizeWinAnsi(title).slice(0, 70), {
        x: margin,
        y: pageH - margin,
        size: 15,
        font: bold,
        color: rgb(0.06, 0.09, 0.16),
      });
    }
    lines.slice(i, i + maxLines).forEach((line, idx) => {
      page.drawText(line, {
        x: margin,
        y: pageH - margin - (i === 0 ? 28 : 0) - idx * lineH,
        size: 11,
        font,
        color: rgb(0.15, 0.18, 0.24),
      });
    });
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename,
    details: `HTML convertido a PDF (${doc.getPageCount()} página(s)) en tu navegador.`,
  };
}
