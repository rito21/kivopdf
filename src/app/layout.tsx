import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "KivoPDF | Herramientas PDF privadas 100% en tu navegador",
  description:
    "Herramientas PDF gratuitas y 100% privadas sin subir archivos a servidores: unir, dividir, comprimir, rotar y convertir PDF en tu navegador.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2880101134285723"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col pt-[60px]">
        <LangProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LangProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }`}
        </Script>
      </body>
    </html>
  );
}
