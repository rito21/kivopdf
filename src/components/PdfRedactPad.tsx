"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export interface RedactBox {
  pageIndex: number;
  xNorm: number;
  yNorm: number;
  wNorm: number;
  hNorm: number;
}

export default function PdfRedactPad({
  file,
  boxes,
  onChange,
}: {
  file: File;
  boxes: RedactBox[];
  onChange: (next: RedactBox[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

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
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = canvasRef.current;
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
  }, [file, pageIndex]);

  const getNormPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getNormPos(e);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setDragCurrent(getNormPos(e));
  };

  const onPointerUp = () => {
    if (dragStart && dragCurrent) {
      const xNorm = Math.min(dragStart.x, dragCurrent.x);
      const yNorm = Math.min(dragStart.y, dragCurrent.y);
      const wNorm = Math.max(0.04, Math.abs(dragCurrent.x - dragStart.x));
      const hNorm = Math.max(0.03, Math.abs(dragCurrent.y - dragStart.y));
      onChange([...boxes, { pageIndex, xNorm, yNorm, wNorm, hNorm }]);
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const pageBoxes = boxes.filter((b) => b.pageIndex === pageIndex);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[#475569]">
          Arrastra sobre la página para marcar áreas negras de censura permanente ({boxes.length} área(s)).
        </p>
        <div className="flex items-center gap-2">
          {boxes.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="inline-flex items-center gap-1 text-[12px] text-[#E5322D] hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpiar todo
            </button>
          )}
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
        {pageBoxes.map((b, i) => (
          <div
            key={i}
            className="absolute bg-black pointer-events-none"
            style={{
              left: `${b.xNorm * 100}%`,
              top: `${b.yNorm * 100}%`,
              width: `${b.wNorm * 100}%`,
              height: `${b.hNorm * 100}%`,
            }}
          />
        ))}
        {dragStart && dragCurrent && (
          <div
            className="absolute bg-black/75 border border-red-500 pointer-events-none"
            style={{
              left: `${Math.min(dragStart.x, dragCurrent.x) * 100}%`,
              top: `${Math.min(dragStart.y, dragCurrent.y) * 100}%`,
              width: `${Math.abs(dragCurrent.x - dragStart.x) * 100}%`,
              height: `${Math.abs(dragCurrent.y - dragStart.y) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
