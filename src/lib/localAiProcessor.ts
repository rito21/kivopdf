import type { ProcessResult } from "./pdfProcessor";
import type { ProgressCallback } from "./qpdfProcessor";

interface TextItemLike {
  str?: string;
  hasEOL?: boolean;
}

export async function extractPdfPagesText(
  file: File,
  onProgress?: ProgressCallback
): Promise<string[]> {
  onProgress?.("Extrayendo texto del PDF...", 10);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pagesText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let pageStr = "";
    for (const item of content.items as TextItemLike[]) {
      if (item.str) {
        pageStr += item.str + (item.hasEOL ? "\n" : " ");
      }
    }
    pagesText.push(pageStr.trim());
    page.cleanup();
  }
  await pdf.cleanup();

  if (pagesText.every((p) => !p)) {
    throw new Error("El PDF no contiene texto seleccionable (puede ser un escaneo).");
  }
  return pagesText;
}

export async function pdfToMarkdown(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const pages = await extractPdfPagesText(file, onProgress);
  onProgress?.("Generando documento Markdown...", 90);

  const title = file.name.replace(/\.pdf$/i, "");
  const md = [
    `# ${title}`,
    "",
    ...pages.flatMap((text, idx) => [`## Página ${idx + 1}`, "", text, ""]),
  ].join("\n");

  return {
    blob: new Blob([md], { type: "text/markdown;charset=utf-8" }),
    filename: `${title}.md`,
    details: `${pages.length} páginas convertidas a Markdown localmente.`,
    previewText: md,
  };
}

async function runLocalLlm(
  prompt: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
  const maxTokens = hasWebGpu ? 320 : 160;

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./ai.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (
      e: MessageEvent<{
        type: "progress" | "done" | "error";
        msg?: string;
        pct?: number;
        text?: string;
        error?: string;
      }>
    ) => {
      const data = e.data;
      if (data.type === "progress" && data.msg) {
        onProgress?.(data.msg, data.pct);
      } else if (data.type === "done") {
        worker.terminate();
        resolve(data.text || "");
      } else if (data.type === "error") {
        worker.terminate();
        reject(new Error(data.error || "Error en Web Worker de IA."));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(err.message || "Error iniciando Web Worker de IA."));
    };

    worker.postMessage({ prompt, maxTokens });
  });
}

export async function summarizePdfAi(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const pages = await extractPdfPagesText(file, onProgress);
  const snippet = pages.join("\n\n").slice(0, 1800);
  const summary = await runLocalLlm(
    `Resume en español los puntos clave del siguiente documento de forma clara y estructurada:\n\n${snippet}`,
    onProgress
  );

  const md = `# Resumen de ${file.name}\n\n${summary}\n`;
  return {
    blob: new Blob([md], { type: "text/markdown;charset=utf-8" }),
    filename: `resumen_${file.name.replace(/\.pdf$/i, "")}.md`,
    details: "Resumen generado 100 % en tu navegador con Qwen2.5 0.5B (4-bit).",
    previewText: summary,
  };
}

export async function translatePdfAi(
  file: File,
  targetLang: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const pages = await extractPdfPagesText(file, onProgress);
  const snippet = pages.join("\n\n").slice(0, 1600);
  const translated = await runLocalLlm(
    `Traduce fielmente al idioma ${targetLang} el siguiente texto manteniendo su estructura:\n\n${snippet}`,
    onProgress
  );

  const md = `# Traducción (${targetLang}) — ${file.name}\n\n${translated}\n`;
  return {
    blob: new Blob([md], { type: "text/markdown;charset=utf-8" }),
    filename: `traducido_${file.name.replace(/\.pdf$/i, "")}.md`,
    details: `Traducido a ${targetLang} 100 % en tu navegador (4-bit).`,
    previewText: translated,
  };
}
