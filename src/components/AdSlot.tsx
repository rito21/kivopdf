"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  slotId,
  format = "auto",
  compact = false,
}: {
  slotId: string;
  format?: "auto" | "horizontal" | "rectangle";
  compact?: boolean;
}) {
  const { locale } = useLang();

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slotId, locale]);

  const minH = compact
    ? "min-h-[90px]"
    : format === "rectangle"
      ? "min-h-[250px]"
      : "min-h-[100px]";

  return (
    <aside
      aria-label="AdSense"
      className={`w-full max-w-[960px] mx-auto my-5 ${minH} overflow-hidden flex items-center justify-center`}
    >
      <ins
        key={`${slotId}-${locale}`}
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2880101134285723"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-region={locale}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
