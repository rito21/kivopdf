import JSZip from "jszip";
import type { ProcessResult } from "./pdfProcessor";

export async function pdfToJpg(
  file: File,
  scale = 1.5,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessResult> {
  onProgress?.("Cargando motor de renderizado PDF...", 10);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;

  const zip = new JSZip();
  let singleBlob: Blob | null = null;

  for (let i = 1; i <= total; i++) {
    onProgress?.(
      `Renderizando página ${i} de ${total}...`,
      Math.round((i / total) * 90)
    );
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar Canvas 2D.");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const jpgBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Error generando JPG."))),
        "image/jpeg",
        0.88
      );
    });

    if (total === 1) {
      singleBlob = jpgBlob;
    } else {
      zip.file(`pagina_${i}.jpg`, jpgBlob);
    }

    // Liberar memoria RAM explícitamente (crítico en iOS/Safari)
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  await pdf.cleanup();

  if (total === 1 && singleBlob) {
    return {
      blob: singleBlob,
      filename: `${file.name.replace(/\.pdf$/i, "")}.jpg`,
      details: "1 página convertida a JPG en tu navegador.",
    };
  }

  onProgress?.("Empaquetando imágenes en ZIP...");
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return {
    blob: zipBlob,
    filename: `${file.name.replace(/\.pdf$/i, "")}_imagenes.zip`,
    details: `${total} páginas convertidas a JPG (ZIP).`,
  };
}
