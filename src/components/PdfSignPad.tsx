"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eraser, PenTool, Type, ImagePlus } from "lucide-react";

export interface PagePlacement {
  enabled: boolean;
  xNorm: number;
  yNorm: number;
}

export interface PlacementState {
  pageIndex: number;
  scale: number;
  pagePlacements: Record<number, PagePlacement>;
  mode: "text" | "draw" | "upload";
  text: string;
  signaturePngDataUrl: string | null;
}

export default function PdfSignPad({
  file,
  isSignTool,
  value,
  onChange,
}: {
  file: File;
  isSignTool: boolean;
  value: PlacementState;
  onChange: (next: PlacementState) => void;
}) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [numPages, setNumPages] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [removeWhiteBg, setRemoveWhiteBg] = useState(true);

  // Render selected PDF page into preview canvas
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      if (cancelled) return;
      setNumPages(pdf.numPages);

      const pageNum = Math.min(value.pageIndex + 1, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.1 });
      const canvas = previewCanvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      page.cleanup();
      await pdf.cleanup();
    })();
    return () => {
      cancelled = true;
    };
  }, [file, value.pageIndex]);

  const currentPlacement: PagePlacement = value.pagePlacements[value.pageIndex] ?? {
    enabled: value.pageIndex === 0,
    xNorm: 0.25,
    yNorm: 0.85,
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xNorm = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const yNorm = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    onChange({
      ...value,
      pagePlacements: {
        ...value.pagePlacements,
        [value.pageIndex]: { enabled: true, xNorm, yNorm },
      },
    });
  };

  const toggleCurrentPage = (enabled: boolean) => {
    onChange({
      ...value,
      pagePlacements: {
        ...value.pagePlacements,
        [value.pageIndex]: { ...currentPlacement, enabled },
      },
    });
  };

  const applyToAllPages = () => {
    const next: Record<number, PagePlacement> = {};
    for (let i = 0; i < numPages; i++) {
      next[i] = {
        enabled: true,
        xNorm: currentPlacement.xNorm,
        yNorm: currentPlacement.yNorm,
      };
    }
    onChange({ ...value, pagePlacements: next });
  };

  const enabledPagesList = Object.entries(value.pagePlacements)
    .filter(([, p]) => p.enabled)
    .map(([idx]) => Number(idx) + 1)
    .sort((a, b) => a - b);

  const getDrawPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = drawCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getDrawPos(e);
    ctx.strokeStyle = "#1E3A8A";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = drawCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getDrawPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = drawCanvasRef.current;
    if (canvas) {
      onChange({ ...value, signaturePngDataUrl: canvas.toDataURL("image/png") });
    }
  };

  const clearDraw = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({ ...value, signaturePngDataUrl: null });
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    const url = URL.createObjectURL(imgFile);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const maxW = 480;
      const scale = img.width > maxW ? maxW / img.width : 1;
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, c.width, c.height);
        if (removeWhiteBg) {
          const imgData = ctx.getImageData(0, 0, c.width, c.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220) {
              d[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
        onChange({ ...value, mode: "upload", signaturePngDataUrl: c.toDataURL("image/png") });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left: Controls & Signature Pad */}
      <div className="space-y-4">
        {isSignTool && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: "text", signaturePngDataUrl: null })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-medium cursor-pointer ${
                value.mode === "text"
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#334155] border-[#E2E8F0]"
              }`}
            >
              <Type className="w-4 h-4" /> Texto
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: "draw" })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-medium cursor-pointer ${
                value.mode === "draw"
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#334155] border-[#E2E8F0]"
              }`}
            >
              <PenTool className="w-4 h-4" /> Dibujar firma
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, mode: "upload" });
                uploadRef.current?.click();
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-medium cursor-pointer ${
                value.mode === "upload"
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#334155] border-[#E2E8F0]"
              }`}
            >
              <ImagePlus className="w-4 h-4" /> Subir firma
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleUploadSignature}
            />
          </div>
        )}

        {value.mode === "text" || !isSignTool ? (
          <div>
            <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
              {isSignTool ? "Texto de firma:" : "Texto a insertar:"}
            </label>
            <input
              type="text"
              value={value.text}
              onChange={(e) => onChange({ ...value, text: e.target.value })}
              className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-[14px]"
            />
          </div>
        ) : value.mode === "upload" ? (
          <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#0F172A]">
                Imagen de firma (PNG / JPG):
              </span>
              <button
                type="button"
                onClick={() => uploadRef.current?.click()}
                className="text-[12px] font-medium text-[#4338CA] hover:underline cursor-pointer"
              >
                Elegir otra imagen
              </button>
            </div>
            {value.signaturePngDataUrl ? (
              <img
                src={value.signaturePngDataUrl}
                alt="Firma subida"
                className="max-h-20 w-auto bg-white p-2 rounded border border-[#E2E8F0]"
              />
            ) : (
              <p className="text-[12px] text-[#64748B]">
                Selecciona una imagen con tu firma para previsualizarla.
              </p>
            )}
            <label className="flex items-center gap-2 text-[12px] text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={removeWhiteBg}
                onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                className="accent-[#4338CA]"
              />
              Quitar fondo blanco automáticamente al subir
            </label>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-[#0F172A]">
                Dibuja tu firma aquí:
              </label>
              <button
                type="button"
                onClick={clearDraw}
                className="inline-flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>
            <canvas
              ref={drawCanvasRef}
              width={360}
              height={130}
              onPointerDown={startDraw}
              onPointerMove={moveDraw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              className="w-full h-[130px] bg-[#FAFAF9] border border-[#CBD5E1] rounded-xl touch-none cursor-crosshair"
            />
          </div>
        )}

        <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
          <div>
            <label className="block text-[12px] font-medium text-[#0F172A] mb-1">
              Tamaño ({Math.round(value.scale * 100)}%):
            </label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={value.scale}
              onChange={(e) => onChange({ ...value, scale: Number(e.target.value) })}
              className="w-full max-w-xs accent-[#4338CA]"
            />
          </div>
          {numPages > 1 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPlacement.enabled}
                    onChange={(e) => toggleCurrentPage(e.target.checked)}
                    className="accent-[#4338CA]"
                  />
                  Incluir en página {value.pageIndex + 1}
                </label>
                <button
                  type="button"
                  onClick={applyToAllPages}
                  className="text-[12px] font-medium text-[#4338CA] hover:underline cursor-pointer"
                >
                  Copiar posición a todas
                </button>
              </div>
              <p className="text-[12px] text-[#64748B]">
                Páginas activas:{" "}
                {enabledPagesList.length > 0 ? enabledPagesList.join(", ") : "Ninguna"}
              </p>
            </div>
          )}
        </div>

        <p className="text-[12px] text-[#64748B]">
          Haz clic sobre la vista previa de la página para elegir exactamente dónde colocar la{" "}
          {isSignTool ? "firma" : "anotación"}.
        </p>
      </div>

      {/* Right: Interactive Page Preview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[13px] text-[#334155]">
          <span className="font-medium">
            Página {value.pageIndex + 1} de {numPages}
          </span>
          {numPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={value.pageIndex <= 0}
                onClick={() => onChange({ ...value, pageIndex: value.pageIndex - 1 })}
                className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={value.pageIndex >= numPages - 1}
                onClick={() => onChange({ ...value, pageIndex: value.pageIndex + 1 })}
                className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div
          onClick={handlePreviewClick}
          className="relative inline-block border border-[#CBD5E1] rounded-xl overflow-hidden bg-white shadow-sm cursor-crosshair max-w-full"
        >
          <canvas ref={previewCanvasRef} className="block max-w-full h-auto max-h-[360px]" />
          {currentPlacement.enabled && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none px-2.5 py-1 rounded border-2 border-[#4338CA] bg-indigo-50/90 text-[#1E3A8A] text-[12px] font-semibold whitespace-nowrap shadow-sm"
              style={{
                left: `${currentPlacement.xNorm * 100}%`,
                top: `${currentPlacement.yNorm * 100}%`,
              }}
            >
              {(value.mode === "draw" || value.mode === "upload") && value.signaturePngDataUrl ? (
                <img
                  src={value.signaturePngDataUrl}
                  alt="Firma"
                  style={{ height: `${Math.round(32 * value.scale)}px` }}
                  className="w-auto"
                />
              ) : (
                <span style={{ fontSize: `${Math.round(12 * value.scale)}px` }}>
                  {value.text || "Firma aquí"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
