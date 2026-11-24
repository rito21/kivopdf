import { PDFDocument, PDFName, degrees, rgb, StandardFonts, PDFTextField, PDFCheckBox, PDFDropdown } from "pdf-lib";
import JSZip from "jszip";

export interface ProcessResult {
  blob: Blob;
  filename: string;
  details: string;
  previewText?: string;
}

function parsePageRanges(input: string, maxPages: number): number[] {
  const result: number[] = [];
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(startRaw) && !isNaN(endRaw)) {
        const start = Math.max(1, Math.min(startRaw, maxPages));
        const end = Math.max(1, Math.min(endRaw, maxPages));
        for (let i = start; i <= end; i++) result.push(i - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        result.push(page - 1);
      }
    }
  }
  return Array.from(new Set(result));
}

export async function mergePdfs(files: File[]): Promise<ProcessResult> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const out = await merged.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: "kivopdf_unido.pdf",
    details: `${files.length} archivos unidos (${merged.getPageCount()} páginas totales).`,
  };
}

export async function splitPdf(file: File, rangeStr: string): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();

  if (rangeStr.trim()) {
    const indices = parsePageRanges(rangeStr, total);
    if (indices.length === 0) {
      throw new Error(`Rango inválido. El documento tiene ${total} páginas.`);
    }
    const outDoc = await PDFDocument.create();
    const pages = await outDoc.copyPages(src, indices);
    pages.forEach((p) => outDoc.addPage(p));
    const out = await outDoc.save();
    return {
      blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
      filename: "kivopdf_dividido.pdf",
      details: `Extraídas ${indices.length} páginas de ${total}.`,
    };
  }

  const zip = new JSZip();
  for (let i = 0; i < total; i++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(src, [i]);
    single.addPage(page);
    const out = await single.save();
    zip.file(`pagina_${i + 1}.pdf`, out);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return {
    blob: zipBlob,
    filename: "kivopdf_paginas.zip",
    details: `Dividido en ${total} archivos PDF individuales (ZIP).`,
  };
}

export async function rotatePdf(file: File, angle: 90 | 180 | 270): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `rotado_${file.name}`,
    details: `Todas las páginas rotadas ${angle}°.`,
  };
}

export async function compressPdf(file: File): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  const out = await doc.save({ useObjectStreams: true });
  const origKb = (bytes.byteLength / 1024).toFixed(1);
  const newKb = (out.byteLength / 1024).toFixed(1);
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `comprimido_${file.name}`,
    details: `Optimizado con Object Streams: ${origKb} KB → ${newKb} KB.`,
  };
}

export async function imagesToPdf(files: File[]): Promise<ProcessResult> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: "imagenes_a_pdf.pdf",
    details: `${files.length} imagen(es) convertidas a PDF.`,
  };
}

export async function addWatermark(file: File, text: string): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const label = text.trim() || "CONFIDENCIAL";

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(label, {
      x: width * 0.18,
      y: height * 0.45,
      size: Math.min(width, height) * 0.08,
      font,
      color: rgb(0.9, 0.2, 0.18),
      opacity: 0.28,
      rotate: degrees(35),
    });
  });

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `marca_${file.name}`,
    details: `Marca de agua "${label}" aplicada en ${doc.getPageCount()} páginas.`,
  };
}

export async function addPageNumbers(file: File): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const text = `${idx + 1} / ${pages.length}`;
    page.drawText(text, {
      x: width / 2 - text.length * 3,
      y: 20,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.24),
    });
  });

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `numerado_${file.name}`,
    details: `Numeración añadida a ${pages.length} páginas.`,
  };
}

export interface CropBoxNorm {
  xNorm: number;
  yNorm: number;
  wNorm: number;
  hNorm: number;
}

export async function cropPdfBox(
  file: File,
  box: CropBoxNorm
): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const x = Math.max(0, box.xNorm * width);
    const w = Math.max(20, Math.min(width - x, box.wNorm * width));
    const h = Math.max(20, Math.min(height, box.hNorm * height));
    const y = Math.max(0, (1 - box.yNorm - box.hNorm) * height);
    page.setCropBox(x, y, w, h);
  });
  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `recortado_${file.name}`,
    details: `Área visual recortada en ${doc.getPageCount()} páginas.`,
  };
}

export async function reorderPdfByIndices(
  file: File,
  indices: number[]
): Promise<ProcessResult> {
  if (indices.length === 0) {
    throw new Error("Debe quedar al menos una página en el documento.");
  }
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();
  const pages = await outDoc.copyPages(src, indices);
  pages.forEach((p) => outDoc.addPage(p));
  const out = await outDoc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `ordenado_${file.name}`,
    details: `Documento generado con ${indices.length} página(s) en el nuevo orden.`,
  };
}

export async function reorderPdf(file: File, orderStr: string): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = orderStr.trim()
    ? parsePageRanges(orderStr, total)
    : src.getPageIndices().reverse();

  if (indices.length === 0) {
    throw new Error(`Indica páginas válidas entre 1 y ${total}.`);
  }

  const outDoc = await PDFDocument.create();
  const pages = await outDoc.copyPages(src, indices);
  pages.forEach((p) => outDoc.addPage(p));
  const out = await outDoc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `ordenado_${file.name}`,
    details: `Documento generado con ${indices.length} páginas.`,
  };
}

export interface PagePlacementItem {
  pageIndex: number;
  xNorm: number;
  yNorm: number;
}

export interface StampOptions {
  text?: string;
  pageIndex?: number;
  xNorm?: number; // 0..1 from left
  yNorm?: number; // 0..1 from top
  scale?: number; // 0.5..2.0
  applyAllPages?: boolean;
  placements?: PagePlacementItem[];
  signaturePngDataUrl?: string | null;
}

export async function stampTextPdf(
  file: File,
  options: StampOptions | string
): Promise<ProcessResult> {
  const opts: StampOptions =
    typeof options === "string" ? { text: options } : options;
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = doc.getPages();

  const items: PagePlacementItem[] =
    opts.placements && opts.placements.length > 0
      ? opts.placements.filter((p) => p.pageIndex >= 0 && p.pageIndex < pages.length)
      : opts.applyAllPages
        ? pages.map((_, idx) => ({
            pageIndex: idx,
            xNorm: opts.xNorm ?? 0.25,
            yNorm: opts.yNorm ?? 0.85,
          }))
        : [
            {
              pageIndex: Math.max(0, Math.min(opts.pageIndex ?? 0, pages.length - 1)),
              xNorm: opts.xNorm ?? 0.25,
              yNorm: opts.yNorm ?? 0.85,
            },
          ];

  if (items.length === 0) {
    throw new Error("Activa al menos una página donde colocar la firma.");
  }

  const scale = opts.scale ?? 1;

  if (opts.signaturePngDataUrl) {
    const base64 = opts.signaturePngDataUrl.split(",")[1];
    const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pngImage = await doc.embedPng(pngBytes);

    for (const item of items) {
      const targetPage = pages[item.pageIndex];
      const { width, height } = targetPage.getSize();
      const sigW = Math.min(width * 0.7, 150 * scale);
      const sigH = (pngImage.height / pngImage.width) * sigW;
      const drawX = Math.max(0, Math.min(width - sigW, item.xNorm * width - sigW / 2));
      const drawY = Math.max(0, Math.min(height - sigH, (1 - item.yNorm) * height - sigH / 2));
      targetPage.drawImage(pngImage, { x: drawX, y: drawY, width: sigW, height: sigH });
    }
    const out = await doc.save();
    return {
      blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
      filename: `firmado_${file.name}`,
      details: `Firma insertada en ${items.length} página(s).`,
    };
  }

  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const label = (opts.text || "").trim() || "Firmado con KivoPDF";
  const fontSize = Math.round(14 * scale);

  for (const item of items) {
    const targetPage = pages[item.pageIndex];
    const { width, height } = targetPage.getSize();
    const drawX = Math.max(12, Math.min(width - 80, item.xNorm * width));
    const drawY = Math.max(14, Math.min(height - 20, (1 - item.yNorm) * height));
    targetPage.drawText(label, {
      x: drawX,
      y: drawY,
      size: fontSize,
      font,
      color: rgb(0.12, 0.25, 0.55),
    });
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `editado_${file.name}`,
    details: `"${label}" insertado en ${items.length} página(s).`,
  };
}

export async function repairPdf(file: File): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `reparado_${file.name}`,
    details: `Estructura PDF reconstruida (${doc.getPageCount()} páginas).`,
  };
}

export interface RedactArea {
  pageIndex: number;
  xNorm: number;
  yNorm: number;
  wNorm: number;
  hNorm: number;
}

export async function redactPdfPermanent(
  file: File,
  boxes: RedactArea[]
): Promise<ProcessResult> {
  if (boxes.length === 0) {
    throw new Error("Marca al menos un área negra sobre el documento para censurar.");
  }
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const srcBytes = new Uint8Array(await file.arrayBuffer());
  const pdfjsDoc = await pdfjs.getDocument({ data: srcBytes }).promise;
  const outDoc = await PDFDocument.create();

  for (let i = 0; i < pdfjsDoc.numPages; i++) {
    const pageBoxes = boxes.filter((b) => b.pageIndex === i);
    const page = await pdfjsDoc.getPage(i + 1);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar Canvas 2D.");

    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

    // Burn permanent black rectangles into rasterized page so underlying text is destroyed
    ctx.fillStyle = "#000000";
    for (const b of pageBoxes) {
      ctx.fillRect(
        b.xNorm * canvas.width,
        b.yNorm * canvas.height,
        b.wNorm * canvas.width,
        b.hNorm * canvas.height
      );
    }

    const pngUrl = canvas.toDataURL("image/png");
    const pngBytes = Uint8Array.from(atob(pngUrl.split(",")[1]), (c) => c.charCodeAt(0));
    const embedded = await outDoc.embedPng(pngBytes);
    const outPage = outDoc.addPage([vp.width, vp.height]);
    outPage.drawImage(embedded, { x: 0, y: 0, width: vp.width, height: vp.height });

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  await pdfjsDoc.cleanup();
  const outBytes = await outDoc.save();
  return {
    blob: new Blob([new Uint8Array(outBytes)], { type: "application/pdf" }),
    filename: `censurado_${file.name}`,
    details: `${boxes.length} área(s) censuradas permanentemente.`,
  };
}

export interface FormFieldMeta {
  name: string;
  type: "text" | "checkbox" | "dropdown";
  value: string | boolean;
  options?: string[];
}

export async function inspectPdfForm(file: File): Promise<FormFieldMeta[]> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();
  return form.getFields().map((f) => {
    if (f instanceof PDFCheckBox) {
      return { name: f.getName(), type: "checkbox" as const, value: f.isChecked() };
    }
    if (f instanceof PDFDropdown) {
      return {
        name: f.getName(),
        type: "dropdown" as const,
        value: f.getSelected()[0] || "",
        options: f.getOptions(),
      };
    }
    if (f instanceof PDFTextField) {
      return { name: f.getName(), type: "text" as const, value: f.getText() || "" };
    }
    return { name: f.getName(), type: "text" as const, value: "" };
  });
}

export async function fillPdfForm(
  file: File,
  values: Record<string, string | boolean>
): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();

  for (const field of form.getFields()) {
    const val = values[field.getName()];
    if (val === undefined) continue;
    if (field instanceof PDFCheckBox && typeof val === "boolean") {
      if (val) field.check();
      else field.uncheck();
    } else if (field instanceof PDFDropdown && typeof val === "string" && val) {
      field.select(val);
    } else if (field instanceof PDFTextField && typeof val === "string") {
      field.setText(val);
    }
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `rellenado_${file.name}`,
    details: `Formulario completado (${form.getFields().length} campos).`,
  };
}

export async function convertToPdfA(file: File): Promise<ProcessResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const now = new Date();

  doc.setProducer("KivoPDF Archival Engine");
  doc.setCreator("KivoPDF");
  doc.setCreationDate(now);
  doc.setModificationDate(now);

  const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const metadataStream = doc.context.stream(xmp, {
    Type: "Metadata",
    Subtype: "XML",
  });
  const metadataRef = doc.context.register(metadataStream);
  doc.catalog.set(PDFName.of("Metadata"), metadataRef);

  const out = await doc.save({ useObjectStreams: false });
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `pdfa_${file.name}`,
    details: `Metadatos XMP PDF/A-1b incrustados (${doc.getPageCount()} páginas).`,
  };
}
