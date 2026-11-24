"use client";

import { ShieldCheck, Lock, FileCheck2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function SecondarySections() {
  const { t } = useLang();

  return (
    <div className="bg-white border-t border-[#E2E8F0]">
      <section id="seguridad" className="max-w-[960px] mx-auto px-6 py-16 text-center">
        <h2 className="text-[26px] sm:text-[30px] font-semibold text-[#0F172A] mb-3">
          {t.trustTitle}
        </h2>
        <p className="text-[15px] text-[#475569] max-w-2xl mx-auto mb-8 leading-relaxed">
          {t.trustSubtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            { icon: ShieldCheck, label: t.trustLocal },
            { icon: Lock, label: t.trustHttps },
            { icon: FileCheck2, label: t.trustStandard },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#E2E8F0] bg-[#FAFAF9] text-[#334155] text-[14px] font-medium"
              >
                <Icon className="w-5 h-5 text-[#4338CA]" strokeWidth={1.5} />
                {badge.label}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
