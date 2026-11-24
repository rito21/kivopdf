import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProcessResult } from "./pdfProcessor";
import type { ProgressCallback } from "./qpdfProcessor";

export async function ocrPdf(
  file: File,
  lang = "spa+eng",
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Cargando motor OCR (Tesseract WASM)...", 10);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const { createWorker } = await import("tesseract.js");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const srcPdf = await pdfjs.getDocument({ data: bytes }).promise;
  const total = srcPdf.numPages;

  const worker = await createWorker(lang, 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(`Reconociendo texto (${Math.round(m.progress * 100)}%)...`, 30 + Math.round(m.progress * 60));
      }
    },
  });

  const outPdf = await PDFDocument.create();
  const font = await outPdf.embedFont(StandardFonts.Helvetica);
  const extractedTexts: string[] = [];

  for (let i = 1; i <= total; i++) {
    onProgress?.(`Procesando OCR página ${i} de ${total}...`, Math.round((i / total) * 85));
    const page = await srcPdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar Canvas 2D.");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const pngDataUrl = canvas.toDataURL("image/png");
    const { data } = await worker.recognize(canvas);

    const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
    const embeddedImg = await outPdf.embedPng(pngBytes);
    const pdfPage = outPdf.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(embeddedImg, { x: 0, y: 0, width: viewport.width, height: viewport.height });

    // Capa de texto seleccionable (invisible)
    const cleanText = (data.text || "").replace(/[^\x20-\x7E\u00C0-\u00FF\n]/g, " ");
    extractedTexts.push(`--- Página ${i} ---\n${data.text.trim()}`);
    const lines = cleanText.split("\n").slice(0, 60);
    lines.forEach((line, idx) => {
      if (line.trim()) {
        pdfPage.drawText(line.slice(0, 110), {
          x: 20,
          y: Math.max(12, viewport.height - 24 - idx * 14),
          size: 10,
          font,
          color: rgb(0, 0, 0),
          opacity: 0.01,
        });
      }
    });

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  await worker.terminate();
  await srcPdf.cleanup();

  const outBytes = await outPdf.save();
  return {
    blob: new Blob([new Uint8Array(outBytes)], { type: "application/pdf" }),
    filename: `ocr_${file.name}`,
    details: `OCR completado en ${total} página(s) con capa de texto seleccionable.`,
    previewText: extractedTexts.join("\n\n"),
  };
}
