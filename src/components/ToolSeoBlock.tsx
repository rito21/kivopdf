"use client";

import { PdfTool } from "@/data/tools";
import { useLang } from "@/lib/i18n";
import { getToolCopy } from "@/lib/toolsI18n";

export default function ToolSeoBlock({ tool }: { tool: PdfTool }) {
  const { lang, t } = useLang();
  const copy = getToolCopy(tool, lang);

  return (
    <section className="bg-white border-t border-[#E2E8F0] py-14 px-4 sm:px-6">
      <div className="max-w-[920px] mx-auto">
        <h2 className="text-[24px] font-bold text-[#0F172A] mb-4">
          {copy.title} — {t.trustLocal}
        </h2>
        <p className="text-[15px] leading-relaxed text-[#475569] mb-6">
          {copy.description} {t.trustSubtitle}
        </p>
      </div>
    </section>
  );
}
