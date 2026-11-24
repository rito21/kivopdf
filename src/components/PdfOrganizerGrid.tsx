"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Trash2, GripVertical } from "lucide-react";

interface ThumbItem {
  originalIndex: number;
  dataUrl: string;
}

export default function PdfOrganizerGrid({
  file,
  onOrderChange,
}: {
  file: File;
  onOrderChange: (indices: number[]) => void;
}) {
  const [thumbs, setThumbs] = useState<ThumbItem[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const list: ThumbItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) break;
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        list.push({ originalIndex: i - 1, dataUrl: canvas.toDataURL("image/jpeg", 0.75) });
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
      await pdf.cleanup();
      if (!cancelled) {
        setThumbs(list);
        onOrderChange(list.map((t) => t.originalIndex));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const updateList = (next: ThumbItem[]) => {
    setThumbs(next);
    onOrderChange(next.map((t) => t.originalIndex));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= thumbs.length) return;
    const next = [...thumbs];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateList(next);
  };

  const removeItem = (idx: number) => {
    if (thumbs.length <= 1) return;
    updateList(thumbs.filter((_, i) => i !== idx));
  };

  const onDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...thumbs];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setDragIdx(null);
    updateList(next);
  };

  if (loading) {
    return (
      <p className="mb-6 text-[13px] text-[#64748B]">
        Generando miniaturas de páginas...
      </p>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <p className="text-[13px] text-[#475569]">
        Arrastra las miniaturas para reordenar o elimina las páginas que no necesites ({thumbs.length} página(s)).
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {thumbs.map((item, idx) => (
          <div
            key={item.originalIndex}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(idx)}
            className="bg-[#FAFAF9] border border-[#E2E8F0] hover:border-[#4338CA] rounded-xl p-2.5 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
          >
            <div className="w-full flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="inline-flex items-center gap-0.5 font-medium text-[#0F172A]">
                <GripVertical className="w-3.5 h-3.5 text-[#94A3B8]" /> Pág. {item.originalIndex + 1}
              </span>
              {thumbs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[#E5322D] hover:opacity-80 cursor-pointer"
                  title="Eliminar página"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <img
              src={item.dataUrl}
              alt={`Página ${item.originalIndex + 1}`}
              className="w-full h-36 object-contain bg-white rounded border border-[#E2E8F0]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveItem(idx, -1)}
                className="p-1 rounded border border-[#E2E8F0] bg-white disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === thumbs.length - 1}
                onClick={() => moveItem(idx, 1)}
                className="p-1 rounded border border-[#E2E8F0] bg-white disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
