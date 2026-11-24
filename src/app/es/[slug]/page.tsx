import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PDF_TOOLS, getToolSeo } from "@/data/tools";
import ToolWorkspace from "@/components/ToolWorkspace";
import ToolSeoBlock from "@/components/ToolSeoBlock";

export function generateStaticParams() {
  return PDF_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = PDF_TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};
  const seo = getToolSeo(tool);

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `https://kivopdf.my.id/es/${tool.slug}/` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      locale: "es_ES",
    },
  };
}

export default async function ToolEsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = PDF_TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const seo = getToolSeo(tool);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${tool.title} - KivoPDF`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        description: seo.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: seo.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolWorkspace tool={tool} />
      <ToolSeoBlock tool={tool} />
    </>
  );
}
