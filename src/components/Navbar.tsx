"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { MEGA_MENU_GROUPS, PDF_TOOLS } from "@/data/tools";
import ToolIcon from "./ToolIcon";
import KivoLogo from "./KivoLogo";
import { LANGUAGES, LangCode, useLang } from "@/lib/i18n";
import { getToolCopy } from "@/lib/toolsI18n";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const labelFor = (slug: string, fallback: string) => {
    const found = PDF_TOOLS.find((x) => x.slug === slug);
    return found ? getToolCopy(found, lang).title : fallback;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[62px] bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile toggle + Logo + Primary Nav */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-1.5 text-[#0F172A] hover:text-[#4338CA]"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link href="/" aria-label="KivoPDF Inicio">
          <KivoLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-[#334155]">
          <Link
            href="/es/unir-pdf"
            className="hover:text-[#4338CA] transition-colors whitespace-nowrap"
          >
            {t.navMerge}
          </Link>
          <Link
            href="/es/dividir-pdf"
            className="hover:text-[#4338CA] transition-colors whitespace-nowrap"
          >
            {t.navSplit}
          </Link>
          <Link
            href="/es/comprimir-pdf"
            className="hover:text-[#4338CA] transition-colors whitespace-nowrap"
          >
            {t.navCompress}
          </Link>

          {/* Dropdown: Convertir PDF */}
          <div className="relative group">
            <button className="flex items-center gap-1 py-4 hover:text-[#4338CA] transition-colors whitespace-nowrap">
              {t.navConvert} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="hidden group-hover:grid grid-cols-2 gap-6 absolute left-0 top-[54px] w-[420px] bg-white border border-[#D6D6DF] rounded-xl shadow-xl p-5 normal-case">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#707078] mb-2.5">
                  {t.navConvertTo}
                </p>
                <ul className="space-y-2">
                  {MEGA_MENU_GROUPS[2].items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/es/${item.slug}`}
                        className="flex items-center gap-2.5 text-[13px] font-medium text-[#33333B] hover:text-[#E5322D]"
                      >
                        <ToolIcon
                          slug={item.slug}
                          color={item.color}
                          bgColor="#F5F5FA"
                          size="sm"
                        />
                        {labelFor(item.slug, item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#707078] mb-2.5">
                  {t.navConvertFrom}
                </p>
                <ul className="space-y-2">
                  {MEGA_MENU_GROUPS[3].items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/es/${item.slug}`}
                        className="flex items-center gap-2.5 text-[13px] font-medium text-[#33333B] hover:text-[#E5322D]"
                      >
                        <ToolIcon
                          slug={item.slug}
                          color={item.color}
                          bgColor="#F5F5FA"
                          size="sm"
                        />
                        {labelFor(item.slug, item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mega-Menu: Todas las herramientas PDF */}
          <div className="relative group">
            <button className="flex items-center gap-1 py-4 hover:text-[#4338CA] transition-colors whitespace-nowrap">
              {t.navAllTools} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="hidden group-hover:grid grid-cols-4 xl:grid-cols-7 gap-5 fixed left-4 right-4 top-[58px] bg-white border border-[#D6D6DF] rounded-xl shadow-2xl p-6 normal-case max-w-[1360px] mx-auto">
              {MEGA_MENU_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#707078] mb-3">
                    {group.title}
                  </p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/es/${item.slug}`}
                          className="flex items-center gap-2 text-[13px] font-medium text-[#33333B] hover:text-[#E5322D]"
                        >
                          <ToolIcon
                            slug={item.slug}
                            color={item.color}
                            bgColor="#F5F5FA"
                            size="sm"
                          />
                          <span className="truncate">{labelFor(item.slug, item.label)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Right: 8-Language Selector */}
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FAFAF9] text-[13px] font-medium text-[#0F172A]">
          <Globe className="w-4 h-4 text-[#4338CA]" strokeWidth={1.5} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            aria-label="Seleccionar idioma"
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bottom-0 bg-white z-40 overflow-y-auto p-5 border-t border-[#D6D6DF]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MEGA_MENU_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#707078] mb-2">
                  {group.title}
                </p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/es/${item.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 text-[14px] font-medium text-[#33333B] py-1"
                      >
                        <ToolIcon
                          slug={item.slug}
                          color={item.color}
                          bgColor="#F5F5FA"
                          size="sm"
                        />
                        {labelFor(item.slug, item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
