"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { LANGUAGES, LangCode, useLang } from "@/lib/i18n";
import KivoLogo from "./KivoLogo";

export default function Footer() {
  const { lang, setLang, t } = useLang();

  return (
    <footer className="bg-[#0F172A] text-white py-10 px-6 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <KivoLogo dark />
          <p className="text-[13px] text-[#94A3B8]">{t.footerCopy}</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#CBD5E1]">
          <Link href="/#herramientas" className="hover:text-white transition-colors">
            {t.footerTools}
          </Link>
          <Link href="/#seguridad" className="hover:text-white transition-colors">
            {t.footerSecurity}
          </Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">
            {t.footerPrivacy}
          </Link>
          <Link href="/sitemap.xml" className="hover:text-white transition-colors">
            Sitemap
          </Link>

          <label className="inline-flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-1.5 text-[12px] text-white">
            <Globe className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={1.5} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              aria-label="Idioma"
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0F172A] text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </footer>
  );
}
