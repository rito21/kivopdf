"use client";

import { useEffect, useState } from "react";
import { FormFieldMeta, inspectPdfForm } from "@/lib/pdfProcessor";

export default function PdfFormFiller({
  file,
  values,
  onChange,
}: {
  file: File;
  values: Record<string, string | boolean>;
  onChange: (next: Record<string, string | boolean>) => void;
}) {
  const [fields, setFields] = useState<FormFieldMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    inspectPdfForm(file)
      .then((list) => {
        if (cancelled) return;
        setFields(list);
        const init: Record<string, string | boolean> = {};
        list.forEach((f) => {
          init[f.name] = f.value;
        });
        onChange(init);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (loading) {
    return <p className="mb-6 text-[13px] text-[#64748B]">Detectando campos del formulario...</p>;
  }

  if (fields.length === 0) {
    return (
      <p className="mb-6 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        Este PDF no contiene campos AcroForm interactivos. Puedes usar <strong>Editar PDF</strong> para añadir texto encima.
      </p>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className="space-y-1">
          {f.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-[13px] font-medium text-[#0F172A] pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.checked })}
                className="accent-[#4338CA]"
              />
              {f.name}
            </label>
          ) : f.type === "dropdown" ? (
            <>
              <label className="block text-[12px] font-medium text-[#475569]">{f.name}</label>
              <select
                value={String(values[f.name] || "")}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] bg-white"
              >
                <option value="">Seleccionar...</option>
                {(f.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block text-[12px] font-medium text-[#475569]">{f.name}</label>
              <input
                type="text"
                value={String(values[f.name] || "")}
                onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px]"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
