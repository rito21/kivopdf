import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ProcessResult } from "./pdfProcessor";
import type { ProgressCallback } from "./qpdfProcessor";

function sanitizeWinAnsi(text: string): string {
  return text.replace(/[^\x20-\x7E\u00A0-\u00FF\n\t]/g, " ");
}

export async function powerpointToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Leyendo presentación PowerPoint (.pptx)...", 20);
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });

  if (slideFiles.length === 0) {
    throw new Error("No se encontraron diapositivas en el archivo .pptx.");
  }

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageW = 960;
  const pageH = 540;

  for (let i = 0; i < slideFiles.length; i++) {
    onProgress?.(`Convirtiendo diapositiva ${i + 1} de ${slideFiles.length}...`, 25 + Math.round(((i + 1) / slideFiles.length) * 65));
    const xmlStr = await zip.files[slideFiles[i]].async("string");
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlStr, "application/xml");
    const paragraphs = Array.from(xml.getElementsByTagName("a:p"))
      .map((p) =>
        Array.from(p.getElementsByTagName("a:t"))
          .map((t) => t.textContent || "")
          .join("")
          .trim()
      )
      .filter(Boolean);

    const page = doc.addPage([pageW, pageH]);
    page.drawText(`Diapositiva ${i + 1}`, {
      x: 48,
      y: pageH - 40,
      size: 11,
      font: bold,
      color: rgb(0.4, 0.45, 0.55),
    });

    paragraphs.slice(0, 18).forEach((line, idx) => {
      const clean = sanitizeWinAnsi(line).slice(0, 105);
      page.drawText(clean, {
        x: 48,
        y: pageH - 80 - idx * 24,
        size: idx === 0 ? 20 : 14,
        font: idx === 0 ? bold : font,
        color: rgb(0.06, 0.09, 0.16),
      });
    });
  }

  const out = await doc.save();
  return {
    blob: new Blob([new Uint8Array(out)], { type: "application/pdf" }),
    filename: `${file.name.replace(/\.(pptx?|PPTX?)$/, "")}.pdf`,
    details: `${slideFiles.length} diapositiva(s) convertidas a PDF.`,
  };
}

export async function pdfToPowerpoint(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.("Renderizando páginas PDF para PowerPoint...", 15);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const total = pdf.numPages;

  const zip = new JSZip();
  const slideIdsXml: string[] = [];
  const presRelsXml: string[] = [];
  const contentTypesSlides: string[] = [];

  for (let i = 1; i <= total; i++) {
    onProgress?.(`Generando diapositiva ${i} de ${total}...`, 15 + Math.round((i / total) * 75));
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar Canvas 2D.");
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

    const jpgBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Error JPG"))), "image/jpeg", 0.85)
    );
    const imgBytes = await jpgBlob.arrayBuffer();
    zip.file(`ppt/media/image${i}.jpg`, imgBytes);

    zip.file(
      `ppt/slides/slide${i}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    <p:pic>
      <p:nvPicPr><p:cNvPr id="2" name="Slide ${i}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
      <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
      <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
    </p:pic>
  </p:spTree></p:cSld>
</p:sld>`
    );

    zip.file(
      `ppt/slides/_rels/slide${i}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpg"/>
</Relationships>`
    );

    slideIdsXml.push(`<p:sldId id="${255 + i}" r:id="rId${i}"/>`);
    presRelsXml.push(
      `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`
    );
    contentTypesSlides.push(
      `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    );

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  await pdf.cleanup();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${contentTypesSlides.join("\n  ")}
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>${slideIdsXml.join("")}</p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`
  );

  zip.file(
    "ppt/_rels/presentation.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRelsXml.join("\n  ")}
</Relationships>`
  );

  const pptxBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  return {
    blob: pptxBlob,
    filename: `${file.name.replace(/\.pdf$/i, "")}.pptx`,
    details: `${total} página(s) convertidas a presentación PowerPoint (.pptx).`,
  };
}
