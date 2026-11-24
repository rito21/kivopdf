import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad y Cookies | KivoPDF",
  description:
    "Información sobre privacidad local, cookies de Google AdSense y cumplimiento normativo (UE RGPD, EE. UU. CCPA/CPRA, Japón APPI y China PIPL).",
};

export default function PrivacidadPage() {
  return (
    <div className="bg-[#FAFAF9] min-h-[calc(100vh-62px)] py-12 px-4 sm:px-6">
      <div className="max-w-[840px] mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#4338CA] mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a KivoPDF
          </Link>
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-6 h-6 text-[#4338CA]" strokeWidth={1.5} />
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#0F172A]">
              Privacidad, Cookies y Cumplimiento Internacional
            </h1>
          </div>
          <p className="text-[14px] text-[#64748B]">
            Última actualización: 2026 · KivoPDF
          </p>
        </div>

        <section className="space-y-2 text-[15px] text-[#334155] leading-relaxed">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            1. Procesamiento 100 % local de tus archivos
          </h2>
          <p>
            KivoPDF procesa todos los archivos PDF, Word, Excel, PowerPoint e imágenes
            directamente en la memoria de tu navegador mediante WebAssembly y JavaScript.
            <strong> Tus documentos nunca se suben, almacenan ni transfieren a ningún servidor propio.</strong>
          </p>
          <p>
            Únicamente guardamos tu preferencia de idioma en <code>localStorage</code> (<code>kivopdf_lang</code>)
            y los motores WebAssembly en la caché local de tu navegador para acelerar futuras cargas.
          </p>
        </section>

        <section className="space-y-2 text-[15px] text-[#334155] leading-relaxed">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            2. Publicidad y Cookies (Google AdSense)
          </h2>
          <p>
            Este sitio es 100 % gratuito y se financia mediante <strong>Google AdSense</strong> (editor{" "}
            <code>ca-pub-2880101134285723</code>). Google y sus socios pueden utilizar cookies o
            identificadores del dispositivo para mostrar anuncios personalizados o no personalizados.
          </p>
        </section>

        <section className="space-y-4 text-[14px] text-[#334155] leading-relaxed border-t border-[#E2E8F0] pt-6">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            3. Cumplimiento por jurisdicción
          </h2>

          <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl p-4 space-y-1">
            <h3 className="font-semibold text-[#0F172A]">
              Unión Europea / EEE / Reino Unido (RGPD y ePrivacy)
            </h3>
            <p>
              No recopilamos datos personales de tus documentos. Para las cookies publicitarias de
              Google AdSense se requiere tu consentimiento previo mediante el mensaje CMP (IAB TCF v2.2)
              mostrado al acceder desde Europa. Puedes retirar o modificar tu consentimiento en cualquier momento.
            </p>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl p-4 space-y-1">
            <h3 className="font-semibold text-[#0F172A]">
              Estados Unidos (CCPA / CPRA y leyes estatales)
            </h3>
            <p>
              KivoPDF no vende datos personales ni archivos. Los residentes de California y otros
              estados de EE. UU. pueden gestionar o limitar el uso de identificadores publicitarios de
              Google desde la configuración de anuncios de Google (<code>adssettings.google.com</code>)
              o el aviso estatal de AdSense («Do Not Sell or Share My Personal Information»).
            </p>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl p-4 space-y-1">
            <h3 className="font-semibold text-[#0F172A]">
              Japón (APPI — Act on the Protection of Personal Information)
            </h3>
            <p>
              De acuerdo con la normativa japonesa APPI sobre transmisión externa de información de
              usuario, informamos que el único tercero que puede recibir identificadores técnicos de
              navegación (cookies/IP) es Google LLC para la prestación del servicio Google AdSense.
              Los archivos PDF permanecen estrictamente en el dispositivo del usuario.
            </p>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl p-4 space-y-1">
            <h3 className="font-semibold text-[#0F172A]">
              China (PIPL — Personal Information Protection Law)
            </h3>
            <p>
              KivoPDF no recopila, almacena ni transfiere documentos de usuarios en servidores externos.
              El procesamiento ocurre íntegramente de forma local en el navegador conforme al principio
              de minimización de datos de la PIPL. Ten en cuenta que los servicios de terceros de Google
              AdSense pueden estar restringidos o bloqueados en China continental.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
