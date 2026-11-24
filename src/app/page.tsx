"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORIES, PDF_TOOLS, ToolCategory } from "@/data/tools";
import ToolIcon from "@/components/ToolIcon";
import SecondarySections from "@/components/SecondarySections";
import AdSlot from "@/components/AdSlot";
import { useLang } from "@/lib/i18n";
import { getToolCopy } from "@/lib/toolsI18n";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { lang, t } = useLang();

  const catLabels: Record<ToolCategory, string> = {
    all: t.catAll,
    workflows: t.catWorkflows,
    organize: t.catOrganize,
    optimize: t.catOptimize,
    convert: t.catConvert,
    edit: t.catEdit,
    security: t.catSecurity,
    intelligence: t.catIntelligence,
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleTools = PDF_TOOLS.filter((tool) => {
    if (q) {
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
      );
    }
    if (activeCategory === "all") return tool.category !== "workflows";
    return tool.category === activeCategory;
  });

  return (
    <div className="hero-pattern">
      {/* Hero + Filter Pills + Tools Grid */}
      <section
        id="herramientas"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-12 pb-16"
      >
        {/* Hero Title */}
        <div className="text-center max-w-[820px] mx-auto mb-10">
          <p className="text-[13px] font-medium text-[#4338CA] mb-3">
            {t.heroEyebrow}
          </p>
          <h1 className="text-[32px] sm:text-[44px] leading-[1.15] sm:leading-[52px] font-semibold tracking-tight text-[#0F172A] mb-4">
            {t.heroTitle}
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-[1.55] font-normal text-[#475569]">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-white border border-[#E2E8F0] focus:border-[#4338CA] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`h-[34px] px-4 rounded-[10px] text-[13px] font-medium border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#0F172A] text-white border-[#0F172A]"
                    : "bg-white text-[#334155] border-[#E2E8F0] hover:border-[#4338CA] hover:text-[#4338CA]"
                }`}
              >
                {catLabels[cat.id]}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleTools.map((tool) => {
            const copy = getToolCopy(tool, lang);
            return (
              <Link
                key={tool.slug}
                href={`/es/${tool.slug}`}
                className="group relative bg-white border border-[#E2E8F0] hover:border-[#0F172A]/40 rounded-2xl p-5 flex flex-col justify-between transition-[border-color,box-shadow] duration-150 hover:shadow-sm min-h-[192px]"
              >
                <div>
                  <div className="mb-4">
                    <ToolIcon
                      slug={tool.slug}
                      color={tool.color}
                      bgColor={tool.bgColor}
                    />
                  </div>
                  <h3 className="text-[17px] leading-[24px] font-semibold text-[#0F172A] group-hover:text-[#4338CA] transition-colors mb-1.5">
                    {copy.title}
                  </h3>
                  <p className="text-[13px] leading-[19px] text-[#64748B]">
                    {copy.description}
                  </p>
                </div>

                {tool.ctaLabel && (
                  <span className="mt-4 inline-flex items-center justify-center bg-[#0F172A] text-white text-[13px] font-medium px-4 py-2 rounded-[10px]">
                    {copy.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-10">
          <AdSlot slotId="kivopdf-home-mid" format="horizontal" />
        </div>
      </section>

      <SecondarySections />

      <div className="bg-white pb-8 px-4">
        <AdSlot slotId="kivopdf-home-bottom" format="horizontal" />
      </div>
    </div>
  );
}
