import type { ProcessResult } from "./pdfProcessor";
import type { ProgressCallback } from "./qpdfProcessor";
import { extractPdfPagesText } from "./localAiProcessor";

export async function pdfToWord(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const pages = await extractPdfPagesText(file, onProgress);
  onProgress?.("Generando documento Word...", 85);

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="es">
<head><meta charset="utf-8"><title>${escapeHtml(file.name)}</title></head>
<body style="font-family: Calibri, Arial, sans-serif; line-height: 1.5;">
${pages
  .map(
    (p, idx) =>
      `<div><h3>Página ${idx + 1}</h3><p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p></div>`
  )
  .join("<hr/>")}
</body>
</html>`;

  return {
    blob: new Blob(["\ufeff", html], { type: "application/msword" }),
    filename: `${file.name.replace(/\.pdf$/i, "")}.doc`,
    details: `${pages.length} página(s) exportadas a Word editable (.doc).`,
  };
}

export async function pdfToExcel(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Extrayendo tablas del PDF...", 20);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const XLSX = await import("xlsx");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const wb = XLSX.utils.book_new();

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Procesando página ${i} de ${pdf.numPages}...`, 20 + Math.round((i / pdf.numPages) * 65));
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Agrupar elementos por coordenada Y aproximada (filas)
    const rowsMap = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as { str?: string; transform?: number[] }[]) {
      if (!item.str || !item.str.trim() || !item.transform) continue;
      const yBucket = Math.round(item.transform[5] / 5) * 5;
      const x = item.transform[4];
      const arr = rowsMap.get(yBucket) || [];
      arr.push({ x, str: item.str.trim() });
      rowsMap.set(yBucket, arr);
    }

    const sortedRows = Array.from(rowsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map((c) => c.str));

    const ws = XLSX.utils.aoa_to_sheet(sortedRows.length > 0 ? sortedRows : [["(Sin texto)"]]);
    XLSX.utils.book_append_sheet(wb, ws, `Página ${i}`);
    page.cleanup();
  }

  await pdf.cleanup();
  const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([new Uint8Array(xlsxData)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: `${file.name.replace(/\.pdf$/i, "")}.xlsx`,
    details: `${pdf.numPages} hoja(s) generadas en Excel (.xlsx) localmente.`,
  };
}
