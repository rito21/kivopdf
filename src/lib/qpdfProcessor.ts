import type { ProcessResult } from "./pdfProcessor";

interface QpdfFSExt {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
  unlink: (path: string) => void;
}

export type ProgressCallback = (msg: string, pct?: number) => void;

async function fetchWasmWithProgress(
  url: string,
  onProgress?: ProgressCallback
): Promise<ArrayBuffer> {
  const cacheName = "kivopdf-wasm-v1";
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(url);
      if (cached) {
        onProgress?.("Motor WebAssembly cargado desde caché local...", 75);
        return cached.arrayBuffer();
      }
    } catch {}
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo descargar el motor WASM.");
  const total = Number(res.headers.get("content-length") || 0);
  if (!res.body || !total) {
    onProgress?.("Descargando motor WebAssembly...", 40);
    const buf = await res.arrayBuffer();
    if (typeof caches !== "undefined") {
      caches.open(cacheName).then((c) => c.put(url, new Response(buf.slice(0)))).catch(() => {});
    }
    return buf;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    const pct = Math.min(75, Math.round((received / total) * 75));
    onProgress?.(`Descargando motor WebAssembly (${pct}%)...`, pct);
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  if (typeof caches !== "undefined") {
    caches
      .open(cacheName)
      .then((c) => c.put(url, new Response(merged.buffer.slice(0), { headers: { "Content-Type": "application/wasm" } })))
      .catch(() => {});
  }
  return merged.buffer;
}

async function runQpdf(
  file: File,
  args: string[],
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  onProgress?.("Iniciando motor WebAssembly...", 10);
  const wasmBinary = await fetchWasmWithProgress("/qpdf.wasm", onProgress);
  const createQpdf = (await import("@neslinesli93/qpdf-wasm")).default;
  const qpdf = await (createQpdf as unknown as (opts: {
    locateFile: () => string;
    wasmBinary: ArrayBuffer;
  }) => Promise<{ callMain: (a: string[]) => number; FS: QpdfFSExt }> )({
    locateFile: () => "/qpdf.wasm",
    wasmBinary,
  });
  const fs = qpdf.FS;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inPath = "/input.pdf";
  const outPath = "/output.pdf";

  onProgress?.("Procesando PDF localmente en WebAssembly...", 85);
  fs.writeFile(inPath, bytes);
  try {
    const exitCode = qpdf.callMain([inPath, ...args, outPath]);
    if (exitCode !== 0 && exitCode !== 3) {
      throw new Error("No se pudo procesar el PDF (verifica la contraseña si está protegido).");
    }
    onProgress?.("Finalizando archivo...", 100);
    return new Uint8Array(fs.readFile(outPath));
  } finally {
    try {
      fs.unlink(inPath);
    } catch {}
    try {
      fs.unlink(outPath);
    } catch {}
  }
}

export async function compressPdfWasm(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const out = await runQpdf(
    file,
    ["--object-streams=generate", "--compress-streams=y", "--recompress-flate"],
    onProgress
  );
  const origKb = (file.size / 1024).toFixed(1);
  const newKb = (out.byteLength / 1024).toFixed(1);
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `comprimido_${file.name}`,
    details: `Compresión real WASM: ${origKb} KB → ${newKb} KB.`,
  };
}

export async function protectPdfWasm(
  file: File,
  password: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  if (!password.trim()) {
    throw new Error("Introduce una contraseña para proteger el PDF.");
  }
  const out = await runQpdf(
    file,
    ["--encrypt", password, password, "256", "--"],
    onProgress
  );
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `protegido_${file.name}`,
    details: "PDF cifrado con AES-256 directamente en tu navegador.",
  };
}

export async function unlockPdfWasm(
  file: File,
  password: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const args = password.trim()
    ? [`--password=${password}`, "--decrypt"]
    : ["--decrypt"];
  const out = await runQpdf(file, args, onProgress);
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `desbloqueado_${file.name}`,
    details: "Contraseña eliminada localmente sin subir el archivo.",
  };
}
