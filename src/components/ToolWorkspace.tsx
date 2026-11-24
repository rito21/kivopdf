"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { PdfTool } from "@/data/tools";
import ToolIcon from "./ToolIcon";
import AdSlot from "./AdSlot";
import PdfSignPad, { PlacementState } from "./PdfSignPad";
import PdfRedactPad, { RedactBox } from "./PdfRedactPad";
import PdfCompareView from "./PdfCompareView";
import PdfCropPad from "./PdfCropPad";
import PdfOrganizerGrid from "./PdfOrganizerGrid";
import PdfFormFiller from "./PdfFormFiller";
import WorkflowBuilder, { WorkflowStepId } from "./WorkflowBuilder";
import { getDeviceLimits, DeviceLimits } from "@/lib/deviceGuard";
import { useLang } from "@/lib/i18n";
import { getToolCopy } from "@/lib/toolsI18n";
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  imagesToPdf,
  addWatermark,
  addPageNumbers,
  cropPdfBox,
  reorderPdfByIndices,
  reorderPdf,
  stampTextPdf,
  repairPdf,
  redactPdfPermanent,
  fillPdfForm,
  convertToPdfA,
  CropBoxNorm,
  ProcessResult,
} from "@/lib/pdfProcessor";

export default function ToolWorkspace({ tool }: { tool: PdfTool }) {
  const { lang, t } = useLang();
  const copy = getToolCopy(tool, lang);
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tool options
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [rangeStr, setRangeStr] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENCIAL");
  const [placement, setPlacement] = useState<PlacementState>({
    pageIndex: 0,
    scale: 1,
    pagePlacements: { 0: { enabled: true, xNorm: 0.25, yNorm: 0.85 } },
    mode: "text",
    text: "Firmado con KivoPDF",
    signaturePngDataUrl: null,
  });
  const [cropBox, setCropBox] = useState<CropBoxNorm>({
    xNorm: 0.08,
    yNorm: 0.08,
    wNorm: 0.84,
    hNorm: 0.84,
  });
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const [jpgScale, setJpgScale] = useState(1.5);
  const [targetLang, setTargetLang] = useState("Inglés");
  const [ocrLang, setOcrLang] = useState("spa+eng");
  const [redactBoxes, setRedactBoxes] = useState<RedactBox[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepId[]>(["watermark", "pageNumbers"]);
  const [htmlText, setHtmlText] = useState("<h1>Mi documento HTML</h1><p>Convertido a PDF 100 % en el navegador.</p>");
  const [deviceLimits, setDeviceLimits] = useState<DeviceLimits>({
    isMobileOrSafari: false,
    maxFileSizeMb: 150,
    warningMessage: null,
  });

  useEffect(() => {
    setDeviceLimits(getDeviceLimits());
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const isImageTool = tool.slug === "jpg-a-pdf" || tool.slug === "escanea-a-pdf";
  const isScanTool = tool.slug === "escanea-a-pdf";
  const isWordTool = tool.slug === "word-a-pdf";
  const isExcelTool = tool.slug === "excel-a-pdf";
  const isPptTool = tool.slug === "powerpoint-a-pdf";
  const isHtmlTool = tool.slug === "html-a-pdf";
  const allowMultiple =
    tool.slug === "unir-pdf" ||
    tool.slug === "jpg-a-pdf" ||
    tool.slug === "escanea-a-pdf" ||
    tool.slug === "comparar-pdf";

  const acceptTypes = isImageTool
    ? "image/jpeg,image/png,image/*"
    : isWordTool
      ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : isExcelTool
        ? ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : isPptTool
          ? ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          : isHtmlTool
            ? ".html,.htm,text/html"
            : "application/pdf";

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const totalMb = arr.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
    setResult(null);
    if (totalMb > deviceLimits.maxFileSizeMb) {
      setError(
        `El archivo supera el límite recomendado para este dispositivo (${deviceLimits.maxFileSizeMb} MB) para evitar cierres de memoria.`
      );
      return;
    }
    setError(null);
    setFiles((prev) => (allowMultiple ? [...prev, ...arr] : [arr[0]]));
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    const next = [...files];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setFiles(next);
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
    setResult(null);
  };

  const handleProgress = (msg: string, pct?: number) => {
    setProgressMsg(msg);
    if (typeof pct === "number") setProgressPct(pct);
  };

  const handleProcess = async () => {
    if (files.length === 0 && !isHtmlTool) return;
    setProcessing(true);
    setProgressMsg(null);
    setProgressPct(null);
    setError(null);
    setResult(null);

    try {
      let res: ProcessResult;
      switch (tool.slug) {
        case "unir-pdf":
          res = await mergePdfs(files);
          break;
        case "dividir-pdf":
          res = await splitPdf(files[0], rangeStr);
          break;
        case "rotar-pdf":
          res = await rotatePdf(files[0], angle);
          break;
        case "comprimir-pdf": {
          const { compressPdfWasm } = await import("@/lib/qpdfProcessor");
          res = await compressPdfWasm(files[0], handleProgress);
          break;
        }
        case "proteger-pdf": {
          const { protectPdfWasm } = await import("@/lib/qpdfProcessor");
          res = await protectPdfWasm(files[0], password, handleProgress);
          break;
        }
        case "desbloquear-pdf": {
          const { unlockPdfWasm } = await import("@/lib/qpdfProcessor");
          res = await unlockPdfWasm(files[0], password, handleProgress);
          break;
        }
        case "pdf-a-jpg": {
          const { pdfToJpg } = await import("@/lib/pdfToJpg");
          res = await pdfToJpg(files[0], jpgScale, handleProgress);
          break;
        }
        case "pdf-a-markdown": {
          const { pdfToMarkdown } = await import("@/lib/localAiProcessor");
          res = await pdfToMarkdown(files[0], handleProgress);
          break;
        }
        case "resumir-con-ia": {
          const { summarizePdfAi } = await import("@/lib/localAiProcessor");
          res = await summarizePdfAi(files[0], handleProgress);
          break;
        }
        case "traducir-pdf": {
          const { translatePdfAi } = await import("@/lib/localAiProcessor");
          res = await translatePdfAi(files[0], targetLang, handleProgress);
          break;
        }
        case "ocr-pdf": {
          const { ocrPdf } = await import("@/lib/ocrProcessor");
          res = await ocrPdf(files[0], ocrLang, handleProgress);
          break;
        }
        case "word-a-pdf": {
          const { wordToPdf } = await import("@/lib/officeToPdf");
          res = await wordToPdf(files[0], handleProgress);
          break;
        }
        case "excel-a-pdf": {
          const { excelToPdf } = await import("@/lib/officeToPdf");
          res = await excelToPdf(files[0], handleProgress);
          break;
        }
        case "censurar-pdf":
          res = await redactPdfPermanent(files[0], redactBoxes);
          break;
        case "jpg-a-pdf":
        case "escanea-a-pdf":
          res = await imagesToPdf(files);
          break;
        case "pdf-a-word": {
          const { pdfToWord } = await import("@/lib/pdfToOffice");
          res = await pdfToWord(files[0], handleProgress);
          break;
        }
        case "pdf-a-excel": {
          const { pdfToExcel } = await import("@/lib/pdfToOffice");
          res = await pdfToExcel(files[0], handleProgress);
          break;
        }
        case "powerpoint-a-pdf": {
          const { powerpointToPdf } = await import("@/lib/pptxProcessor");
          res = await powerpointToPdf(files[0], handleProgress);
          break;
        }
        case "pdf-a-powerpoint": {
          const { pdfToPowerpoint } = await import("@/lib/pptxProcessor");
          res = await pdfToPowerpoint(files[0], handleProgress);
          break;
        }
        case "html-a-pdf": {
          const { htmlToPdf } = await import("@/lib/htmlToPdf");
          const content = files.length > 0 ? await files[0].text() : htmlText;
          const outName = files.length > 0 ? `${files[0].name.replace(/\.html?$/i, "")}.pdf` : "pagina_web.pdf";
          res = await htmlToPdf(content, outName);
          break;
        }
        case "pdf-a-pdfa":
          res = await convertToPdfA(files[0]);
          break;
        case "formularios-pdf":
          res = await fillPdfForm(files[0], formValues);
          break;
        case "flujos-de-trabajo": {
          if (workflowSteps.length === 0) {
            throw new Error("Añade al menos un paso al flujo de trabajo.");
          }
          let currentFile = files[0];
          for (let i = 0; i < workflowSteps.length; i++) {
            const step = workflowSteps[i];
            handleProgress(`Ejecutando paso ${i + 1}/${workflowSteps.length}...`, Math.round(((i + 1) / workflowSteps.length) * 90));
            let stepRes: ProcessResult;
            if (step === "rotate90") stepRes = await rotatePdf(currentFile, 90);
            else if (step === "watermark") stepRes = await addWatermark(currentFile, watermarkText);
            else if (step === "pageNumbers") stepRes = await addPageNumbers(currentFile);
            else {
              const { compressPdfWasm } = await import("@/lib/qpdfProcessor");
              stepRes = await compressPdfWasm(currentFile, handleProgress);
            }
            currentFile = new File([stepRes.blob], currentFile.name, { type: "application/pdf" });
          }
          res = {
            blob: currentFile,
            filename: `flujo_${files[0].name}`,
            details: `${workflowSteps.length} pasos ejecutados secuencialmente en tu navegador.`,
          };
          break;
        }
        case "marca-de-agua":
          res = await addWatermark(files[0], watermarkText);
          break;
        case "numeros-de-pagina":
          res = await addPageNumbers(files[0]);
          break;
        case "recortar-pdf":
          res = await cropPdfBox(files[0], cropBox);
          break;
        case "ordenar-pdf":
          res =
            orderedIndices.length > 0
              ? await reorderPdfByIndices(files[0], orderedIndices)
              : await reorderPdf(files[0], rangeStr);
          break;
        case "editar-pdf":
        case "firmar-pdf": {
          const placements = Object.entries(placement.pagePlacements)
            .filter(([, p]) => p.enabled)
            .map(([idx, p]) => ({
              pageIndex: Number(idx),
              xNorm: p.xNorm,
              yNorm: p.yNorm,
            }));
          res = await stampTextPdf(files[0], {
            text: placement.text,
            scale: placement.scale,
            placements,
            signaturePngDataUrl:
              placement.mode === "draw" || placement.mode === "upload"
                ? placement.signaturePngDataUrl
                : null,
          });
          break;
        }
        case "reparar-pdf":
          res = await repairPdf(files[0]);
          break;
        default:
          throw new Error(
            "Esta herramienta requiere procesamiento en servidor (OCR/Office/IA). Prueba Unir, Dividir, Comprimir, Rotar, JPG a PDF, Marca de agua, Números de página, Recortar, Ordenar, Editar o Firmar."
          );
      }
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error procesando el archivo.");
    } finally {
      setProcessing(false);
      setProgressMsg(null);
      setProgressPct(null);
    }
  };

  const triggerDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#F5F5FA] py-10 px-4 sm:px-6">
      <div className="max-w-[960px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#47474F] hover:text-[#4338CA] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToTools}
        </Link>

        {/* Tool Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <ToolIcon
              slug={tool.slug}
              color={tool.color}
              bgColor={tool.bgColor}
              size="lg"
            />
          </div>
          <h1 className="text-[32px] sm:text-[38px] font-semibold text-[#0F172A] mb-2">
            {copy.title}
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#475569] max-w-2xl mx-auto mb-3">
            {copy.description}
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {t.privateBadge}
          </span>
        </div>

        {deviceLimits.warningMessage && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-start gap-2.5 text-[13px]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{deviceLimits.warningMessage}</span>
          </div>
        )}

        <AdSlot slotId={`kivopdf-top-${tool.slug}`} format="horizontal" compact />

        {!tool.clientSupported && (
          <div className="mb-6 bg-[#DEF2FF] border border-[#9FD7FF] text-[#005B99] rounded-xl p-4 flex items-start gap-3 text-[13px]">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              <strong>Modo demostración UI:</strong> Las conversiones Office/IA/OCR
              requieren un backend dedicado. Las herramientas basadas en PDF
              nativo (<strong>Unir, Dividir, Comprimir, Rotar, JPG a PDF, Marca de agua, Números de página, Recortar, Ordenar, Editar, Firmar, Reparar</strong>) funcionan 100% en tu navegador con <code>pdf-lib</code>.
            </span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="bg-white border-2 border-dashed border-[#D6D6DF] hover:border-[#E5322D] rounded-[20px] p-10 text-center transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            capture={isScanTool ? "environment" : undefined}
            multiple={allowMultiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2.5 bg-[#0F172A] hover:bg-[#4338CA] text-white font-semibold text-[17px] px-8 py-4 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            {isScanTool
              ? "Escanear con cámara o subir foto"
              : isImageTool
                ? "Seleccionar imágenes JPG/PNG"
                : isWordTool
                  ? "Seleccionar documento Word (.docx)"
                  : isExcelTool
                    ? "Seleccionar Excel (.xlsx / .csv)"
                    : isPptTool
                      ? "Seleccionar PowerPoint (.pptx)"
                      : isHtmlTool
                        ? "Subir archivo .html (o pega HTML abajo)"
                        : tool.slug === "comparar-pdf"
                          ? "Seleccionar 2 archivos PDF"
                          : t.selectPdf}
          </button>
          <p className="text-[13px] text-[#707078] mt-3">
            {t.dropHint}
          </p>
        </div>

        {/* HTML paste box when no file uploaded */}
        {isHtmlTool && files.length === 0 && (
          <div className="mt-6 bg-white border border-[#E2E8F0] rounded-[20px] p-6 space-y-4">
            <label className="block text-[14px] font-semibold text-[#0F172A]">
              O pega tu código HTML directamente:
            </label>
            <textarea
              rows={5}
              value={htmlText}
              onChange={(e) => setHtmlText(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-xl p-3.5 text-[13px] font-mono text-[#334155]"
            />
            <button
              onClick={handleProcess}
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] disabled:opacity-60 text-white font-semibold text-[15px] px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              {processing ? "Convirtiendo..." : "Convertir HTML a PDF"}
            </button>
            {result && (
              <div className="p-4 rounded-xl bg-[#EEF6E5] border border-[#C6E1A8] flex items-center justify-between gap-4">
                <span className="text-[14px] font-medium text-[#0F172A]">
                  Listo: {result.filename}
                </span>
                <button
                  onClick={triggerDownload}
                  className="inline-flex items-center gap-2 bg-[#0F172A] text-white text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Descargar
                </button>
              </div>
            )}
          </div>
        )}

        {/* File List & Options */}
        {files.length > 0 && (
          <div className="mt-6 bg-white border border-[#D6D6DF] rounded-[20px] p-6">
            <h2 className="text-[15px] font-semibold text-[#33333B] mb-4">
              Archivos seleccionados ({files.length})
            </h2>

            <ul className="space-y-2.5 mb-6">
              {files.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between bg-[#F5F5FA] px-4 py-3 rounded-xl text-[14px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-[#E5322D] shrink-0" />
                    <span className="font-medium text-[#33333B] truncate">
                      {file.name}
                    </span>
                    <span className="text-[12px] text-[#707078] shrink-0">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {allowMultiple && files.length > 1 && (
                      <>
                        <button
                          onClick={() => moveFile(idx, -1)}
                          className="p-1.5 hover:bg-white rounded-md text-[#47474F]"
                          title="Subir"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveFile(idx, 1)}
                          className="p-1.5 hover:bg-white rounded-md text-[#47474F]"
                          title="Bajar"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 hover:bg-white rounded-md text-[#E5322D]"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tool-specific controls */}
            {tool.slug === "rotar-pdf" && (
              <div className="mb-6 flex items-center gap-3 text-[14px]">
                <span className="font-medium text-[#33333B]">Ángulo:</span>
                {([90, 180, 270] as const).map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-medium cursor-pointer ${
                      angle === deg
                        ? "bg-[#292931] text-white border-[#292931]"
                        : "bg-white text-[#33333B] border-[#D6D6DF]"
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            )}

            {tool.slug === "dividir-pdf" && (
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-[#33333B] mb-1.5">
                  Rango de páginas (ej: 1-3,5 — déjalo vacío para dividir todas en ZIP):
                </label>
                <input
                  type="text"
                  value={rangeStr}
                  onChange={(e) => setRangeStr(e.target.value)}
                  placeholder="Ej: 1-3, 5"
                  className="w-full max-w-md border border-[#D6D6DF] rounded-lg px-3.5 py-2 text-[14px]"
                />
              </div>
            )}

            {tool.slug === "ordenar-pdf" && (
              <PdfOrganizerGrid file={files[0]} onOrderChange={setOrderedIndices} />
            )}

            {tool.slug === "marca-de-agua" && (
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-[#33333B] mb-1.5">
                  Texto de la marca de agua:
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full max-w-md border border-[#D6D6DF] rounded-lg px-3.5 py-2 text-[14px]"
                />
              </div>
            )}

            {(tool.slug === "editar-pdf" || tool.slug === "firmar-pdf") && (
              <PdfSignPad
                file={files[0]}
                isSignTool={tool.slug === "firmar-pdf"}
                value={placement}
                onChange={setPlacement}
              />
            )}

            {tool.slug === "recortar-pdf" && (
              <PdfCropPad file={files[0]} box={cropBox} onChange={setCropBox} />
            )}

            {(tool.slug === "proteger-pdf" || tool.slug === "desbloquear-pdf") && (
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                  {tool.slug === "proteger-pdf"
                    ? "Contraseña para cifrar el PDF (AES-256):"
                    : "Contraseña actual del PDF (si tiene):"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full max-w-md border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-[14px]"
                />
              </div>
            )}

            {tool.slug === "pdf-a-jpg" && (
              <div className="mb-6 flex items-center gap-3 text-[14px]">
                <span className="font-medium text-[#0F172A]">Calidad:</span>
                {[
                  { label: "Normal (1x)", value: 1 },
                  { label: "Alta (1.5x)", value: 1.5 },
                  { label: "Ultra (2x)", value: 2 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setJpgScale(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-medium cursor-pointer ${
                      jpgScale === opt.value
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : "bg-white text-[#334155] border-[#E2E8F0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {tool.slug === "traducir-pdf" && (
              <div className="mb-6 flex flex-wrap items-center gap-2.5 text-[14px]">
                <span className="font-medium text-[#0F172A]">Idioma destino:</span>
                {["Inglés", "Francés", "Alemán", "Italiano", "Portugués"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setTargetLang(lang)}
                    className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-medium cursor-pointer ${
                      targetLang === lang
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : "bg-white text-[#334155] border-[#E2E8F0]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {tool.slug === "censurar-pdf" && (
              <PdfRedactPad
                file={files[0]}
                boxes={redactBoxes}
                onChange={setRedactBoxes}
              />
            )}

            {tool.slug === "formularios-pdf" && (
              <PdfFormFiller file={files[0]} values={formValues} onChange={setFormValues} />
            )}

            {tool.slug === "flujos-de-trabajo" && (
              <WorkflowBuilder steps={workflowSteps} onChange={setWorkflowSteps} />
            )}

            {tool.slug === "ocr-pdf" && (
              <div className="mb-6 flex flex-wrap items-center gap-2.5 text-[14px]">
                <span className="font-medium text-[#0F172A]">Idioma OCR:</span>
                {[
                  { label: "Español + Inglés", value: "spa+eng" },
                  { label: "Solo Español", value: "spa" },
                  { label: "Solo Inglés", value: "eng" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOcrLang(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-medium cursor-pointer ${
                      ocrLang === opt.value
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : "bg-white text-[#334155] border-[#E2E8F0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {tool.slug === "comparar-pdf" ? (
              files.length >= 2 ? (
                <PdfCompareView fileA={files[0]} fileB={files[1]} />
              ) : (
                <p className="text-[14px] text-[#64748B]">
                  Selecciona o arrastra un segundo archivo PDF para ver la comparación visual lado a lado.
                </p>
              )
            ) : (
              /* Action button + WASM progress bar */
              <div className="space-y-3">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] disabled:opacity-60 text-white font-semibold text-[16px] px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  {processing && <Loader2 className="w-5 h-5 animate-spin" />}
                  {processing ? t.processing : `${copy.title} · ${t.processNow}`}
                </button>
                {progressMsg && (
                  <div className="max-w-md space-y-1.5">
                    <div className="flex items-center justify-between text-[12px] font-medium text-[#4338CA]">
                      <span>{progressMsg}</span>
                      {progressPct !== null && (
                        <span className="tabular-nums">{progressPct}%</span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#4338CA] transition-[width] duration-150"
                        style={{ width: `${progressPct ?? 35}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-[#C8231E] text-[14px]">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-xl bg-[#EEF6E5] border border-[#C6E1A8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#5EA162] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A] text-[15px]">
                        Listo: {result.filename}
                      </p>
                      <p className="text-[13px] text-[#47474F]">{result.details}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={triggerDownload}
                      className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#4338CA] text-white font-semibold text-[14px] px-5 py-2.5 rounded-lg cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> {t.download}
                    </button>
                    <button
                      onClick={() => {
                        setFiles([]);
                        setResult(null);
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#334155] font-medium text-[13px] px-4 py-2.5 rounded-lg cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {t.processAnother}
                    </button>
                  </div>
                </div>
                {result.previewText && (
                  <pre className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E2E8F0] text-[13px] text-[#334155] whitespace-pre-wrap max-h-[340px] overflow-y-auto leading-relaxed">
                    {result.previewText}
                  </pre>
                )}
                <AdSlot slotId={`kivopdf-result-${tool.slug}`} format="rectangle" />
              </div>
            )}
          </div>
        )}

        <AdSlot slotId={`kivopdf-bottom-${tool.slug}`} format="horizontal" />
      </div>
    </div>
  );
}
