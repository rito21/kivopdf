"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { CropBoxNorm } from "@/lib/pdfProcessor";

export default function PdfCropPad({
  file,
  box,
  onChange,
}: {
  file: File;
  box: CropBoxNorm;
  onChange: (next: CropBoxNorm) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      if (cancelled) return;
      setNumPages(pdf.numPages);

      const page = await pdf.getPage(Math.min(pageIndex + 1, pdf.numPages));
      const vp = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
      page.cleanup();
      await pdf.cleanup();
    })();
    return () => {
      cancelled = true;
    };
  }, [file, pageIndex]);

  const getNorm = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragStart(getNorm(e));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    const cur = getNorm(e);
    onChange({
      xNorm: Math.min(dragStart.x, cur.x),
      yNorm: Math.min(dragStart.y, cur.y),
      wNorm: Math.max(0.08, Math.abs(cur.x - dragStart.x)),
      hNorm: Math.max(0.08, Math.abs(cur.y - dragStart.y)),
    });
  };

  const onPointerUp = () => setDragStart(null);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[#475569]">
          Arrastra sobre la página para definir la caja de recorte visual.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ xNorm: 0.08, yNorm: 0.08, wNorm: 0.84, hNorm: 0.84 })}
            className="inline-flex items-center gap-1 text-[12px] text-[#4338CA] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer
          </button>
          {numPages > 1 && (
            <div className="flex items-center gap-1.5 text-[13px]">
              <button
                type="button"
                disabled={pageIndex <= 0}
                onClick={() => setPageIndex(pageIndex - 1)}
                className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Pág. {pageIndex + 1}/{numPages}
              </span>
              <button
                type="button"
                disabled={pageIndex >= numPages - 1}
                onClick={() => setPageIndex(pageIndex + 1)}
                className="p-1 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative inline-block border border-[#CBD5E1] rounded-xl overflow-hidden bg-white select-none touch-none cursor-crosshair max-w-full"
      >
        <canvas ref={canvasRef} className="block max-w-full h-auto max-h-[420px]" />
        <div
          className="absolute border-2 border-[#4338CA] shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] pointer-events-none"
          style={{
            left: `${box.xNorm * 100}%`,
            top: `${box.yNorm * 100}%`,
            width: `${box.wNorm * 100}%`,
            height: `${box.hNorm * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
