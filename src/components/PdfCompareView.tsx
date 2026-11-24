"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PdfCompareView({ fileA, fileB }: { fileA: File; fileB: File }) {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [maxPages, setMaxPages] = useState(1);
  const [diffPct, setDiffPct] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const [bytesA, bytesB] = await Promise.all([
        fileA.arrayBuffer().then((b) => new Uint8Array(b)),
        fileB.arrayBuffer().then((b) => new Uint8Array(b)),
      ]);
      const [pdfA, pdfB] = await Promise.all([
        pdfjs.getDocument({ data: bytesA }).promise,
        pdfjs.getDocument({ data: bytesB }).promise,
      ]);
      if (cancelled) return;

      const total = Math.max(pdfA.numPages, pdfB.numPages);
      setMaxPages(total);
      const pNum = pageIdx + 1;

      const renderDocPage = async (
        pdf: Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>,
        canvas: HTMLCanvasElement | null
      ) => {
        if (!canvas || pNum > pdf.numPages) {
          if (canvas) {
            canvas.width = 300;
            canvas.height = 400;
            canvas.getContext("2d")?.clearRect(0, 0, 300, 400);
          }
          return;
        }
        const page = await pdf.getPage(pNum);
        const vp = page.getViewport({ scale: 1 });
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        page.cleanup();
      };

      await Promise.all([
        renderDocPage(pdfA, canvasARef.current),
        renderDocPage(pdfB, canvasBRef.current),
      ]);

      // Compute pixel diff
      const cA = canvasARef.current;
      const cB = canvasBRef.current;
      const cD = diffCanvasRef.current;
      if (cA && cB && cD && !cancelled) {
        const w = Math.max(cA.width, cB.width);
        const h = Math.max(cA.height, cB.height);
        cD.width = w;
        cD.height = h;
        const ctxA = cA.getContext("2d");
        const ctxB = cB.getContext("2d");
        const ctxD = cD.getContext("2d");
        if (ctxA && ctxB && ctxD) {
          const imgA = ctxA.getImageData(0, 0, w, h);
          const imgB = ctxB.getImageData(0, 0, w, h);
          const out = ctxD.createImageData(w, h);
          let diffCount = 0;
          for (let i = 0; i < imgA.data.length; i += 4) {
            const delta =
              Math.abs(imgA.data[i] - imgB.data[i]) +
              Math.abs(imgA.data[i + 1] - imgB.data[i + 1]) +
              Math.abs(imgA.data[i + 2] - imgB.data[i + 2]);
            if (delta > 35) {
              diffCount++;
              out.data[i] = 229;
              out.data[i + 1] = 50;
              out.data[i + 2] = 45;
              out.data[i + 3] = 220;
            } else {
              out.data[i] = imgB.data[i];
              out.data[i + 1] = imgB.data[i + 1];
              out.data[i + 2] = imgB.data[i + 2];
              out.data[i + 3] = 75;
            }
          }
          ctxD.putImageData(out, 0, 0);
          setDiffPct(((diffCount / (w * h)) * 100).toFixed(2));
        }
      }

      await Promise.all([pdfA.cleanup(), pdfB.cleanup()]);
    })();
    return () => {
      cancelled = true;
    };
  }, [fileA, fileB, pageIdx]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[14px] font-medium text-[#0F172A]">
          Diferencia visual detectada:{" "}
          <span className="text-[#4338CA] tabular-nums">{diffPct ?? "—"}%</span>
        </div>
        {maxPages > 1 && (
          <div className="flex items-center gap-2 text-[13px]">
            <button
              type="button"
              disabled={pageIdx <= 0}
              onClick={() => setPageIdx(pageIdx - 1)}
              className="p-1.5 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Página {pageIdx + 1} de {maxPages}
            </span>
            <button
              type="button"
              disabled={pageIdx >= maxPages - 1}
              onClick={() => setPageIdx(pageIdx + 1)}
              className="p-1.5 rounded border border-[#E2E8F0] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: `Original: ${fileA.name}`, ref: canvasARef },
          { label: `Comparado: ${fileB.name}`, ref: canvasBRef },
          { label: "Diferencias (en rojo)", ref: diffCanvasRef },
        ].map((pane) => (
          <div
            key={pane.label}
            className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl p-3 space-y-2"
          >
            <p className="text-[12px] font-medium text-[#475569] truncate">{pane.label}</p>
            <canvas
              ref={pane.ref}
              className="w-full h-auto rounded border border-[#E2E8F0] bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
