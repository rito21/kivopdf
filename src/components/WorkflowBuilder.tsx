"use client";

import { Plus, Trash2 } from "lucide-react";

export type WorkflowStepId = "rotate90" | "watermark" | "pageNumbers" | "compress";

const AVAILABLE_STEPS: { id: WorkflowStepId; label: string }[] = [
  { id: "rotate90", label: "Rotar 90°" },
  { id: "watermark", label: "Marca de agua" },
  { id: "pageNumbers", label: "Números de página" },
  { id: "compress", label: "Comprimir PDF (WASM)" },
];

export default function WorkflowBuilder({
  steps,
  onChange,
}: {
  steps: WorkflowStepId[];
  onChange: (next: WorkflowStepId[]) => void;
}) {
  return (
    <div className="mb-6 space-y-3">
      <p className="text-[13px] font-medium text-[#0F172A]">
        Cadena de acciones locales ({steps.length} paso(s)):
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, idx) => {
          const info = AVAILABLE_STEPS.find((a) => a.id === s);
          return (
            <div
              key={`${s}-${idx}`}
              className="inline-flex items-center gap-2 bg-[#FAFAF9] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] text-[#0F172A]"
            >
              <span className="text-[11px] font-semibold text-[#4338CA]">{idx + 1}.</span>
              <span>{info?.label}</span>
              <button
                type="button"
                onClick={() => onChange(steps.filter((_, i) => i !== idx))}
                className="text-[#E5322D] hover:opacity-80 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {AVAILABLE_STEPS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange([...steps, opt.id])}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-[#CBD5E1] hover:border-[#4338CA] text-[12px] font-medium text-[#334155] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#4338CA]" /> {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
