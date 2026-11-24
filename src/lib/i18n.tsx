"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type LangCode = "es" | "en" | "zh" | "hi" | "ar" | "fr" | "pt" | "de";

export const LANGUAGES: {
  code: LangCode;
  label: string;
  locale: string;
  dir?: "rtl" | "ltr";
}[] = [
  { code: "es", label: "Español", locale: "es-ES" },
  { code: "en", label: "English", locale: "en-US" },
  { code: "zh", label: "中文", locale: "zh-CN" },
  { code: "hi", label: "हिन्दी", locale: "hi-IN" },
  { code: "ar", label: "العربية", locale: "ar-AE", dir: "rtl" },
  { code: "fr", label: "Français", locale: "fr-FR" },
  { code: "pt", label: "Português", locale: "pt-BR" },
  { code: "de", label: "Deutsch", locale: "de-DE" },
];

export interface Translations {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  navMerge: string;
  navSplit: string;
  navCompress: string;
  navConvert: string;
  navAllTools: string;
  navConvertTo: string;
  navConvertFrom: string;
  trustTitle: string;
  trustSubtitle: string;
  trustLocal: string;
  trustHttps: string;
  trustStandard: string;
  footerProduct: string;
  footerPrivacy: string;
  footerTools: string;
  footerSecurity: string;
  footerCopy: string;
  backToTools: string;
  privateBadge: string;
  selectPdf: string;
  dropHint: string;
  processNow: string;
  processing: string;
  download: string;
  processAnother: string;
  ready: string;
  catAll: string;
  catWorkflows: string;
  catOrganize: string;
  catOptimize: string;
  catConvert: string;
  catEdit: string;
  catSecurity: string;
  catIntelligence: string;
}

const DICT: Record<LangCode, Translations> = {
  es: {
    heroEyebrow: "100 % Gratis · Procesamiento local en tu navegador · 0 archivos subidos",
    heroTitle: "Herramientas PDF privadas, rápidas y gratuitas",
    heroSubtitle: "Une, divide, comprime, rota, firma y convierte documentos directamente en tu dispositivo sin cuentas ni servidores.",
    searchPlaceholder: "Buscar herramienta (unir, firmar, OCR, Word...)",
    navMerge: "Unir PDF",
    navSplit: "Dividir PDF",
    navCompress: "Comprimir PDF",
    navConvert: "Convertir PDF",
    navAllTools: "Todas las herramientas",
    navConvertTo: "Convertir a PDF",
    navConvertFrom: "Convertir desde PDF",
    trustTitle: "Privacidad real sin servidores",
    trustSubtitle: "Tus documentos nunca salen de tu ordenador o móvil. Todo el procesamiento ocurre localmente mediante WebAssembly y JavaScript.",
    trustLocal: "100 % Procesamiento local",
    trustHttps: "Conexión segura HTTPS",
    trustStandard: "Estándar PDF compatible",
    footerProduct: "Herramientas",
    footerPrivacy: "Privacidad",
    footerTools: "Todas las herramientas",
    footerSecurity: "Seguridad local",
    footerCopy: "© KivoPDF 2026 — Herramientas PDF gratuitas y privadas",
    backToTools: "Volver a todas las herramientas",
    privateBadge: "100 % Privado: tus archivos nunca salen de tu navegador",
    selectPdf: "Seleccionar archivos PDF",
    dropHint: "o arrastra y suelta aquí",
    processNow: "Procesar ahora",
    processing: "Procesando...",
    download: "Descargar",
    processAnother: "Procesar otro archivo",
    ready: "Listo",
    catAll: "Todos",
    catWorkflows: "Flujos de trabajo",
    catOrganize: "Ordenar PDF",
    catOptimize: "Optimizar PDF",
    catConvert: "Convertir PDF",
    catEdit: "Editar PDF",
    catSecurity: "Seguridad PDF",
    catIntelligence: "PDF Intelligence",
  },
  en: {
    heroEyebrow: "100% Free · Local browser processing · 0 files uploaded",
    heroTitle: "Private, fast, and free PDF tools",
    heroSubtitle: "Merge, split, compress, rotate, sign, and convert documents directly on your device with no accounts or servers.",
    searchPlaceholder: "Search tool (merge, sign, OCR, Word...)",
    navMerge: "Merge PDF",
    navSplit: "Split PDF",
    navCompress: "Compress PDF",
    navConvert: "Convert PDF",
    navAllTools: "All tools",
    navConvertTo: "Convert to PDF",
    navConvertFrom: "Convert from PDF",
    trustTitle: "Real privacy with zero servers",
    trustSubtitle: "Your documents never leave your computer or phone. All processing runs locally via WebAssembly and JavaScript.",
    trustLocal: "100% Local processing",
    trustHttps: "Secure HTTPS connection",
    trustStandard: "Standard PDF compatible",
    footerProduct: "Tools",
    footerPrivacy: "Privacy",
    footerTools: "All tools",
    footerSecurity: "Local security",
    footerCopy: "© KivoPDF 2026 — Free and private PDF tools",
    backToTools: "Back to all tools",
    privateBadge: "100% Private: your files never leave your browser",
    selectPdf: "Select PDF files",
    dropHint: "or drag and drop here",
    processNow: "Process now",
    processing: "Processing...",
    download: "Download",
    processAnother: "Process another file",
    ready: "Ready",
    catAll: "All",
    catWorkflows: "Workflows",
    catOrganize: "Organize PDF",
    catOptimize: "Optimize PDF",
    catConvert: "Convert PDF",
    catEdit: "Edit PDF",
    catSecurity: "PDF Security",
    catIntelligence: "PDF Intelligence",
  },
  zh: {
    heroEyebrow: "100% 免费 · 浏览器本地处理 · 零文件上传",
    heroTitle: "私密、快速且免费的 PDF 工具",
    heroSubtitle: "直接在您的设备上合并、拆分、压缩、旋转、签名和转换文档，无需账号或服务器。",
    searchPlaceholder: "搜索工具（合并、签名、OCR、Word...）",
    navMerge: "合并 PDF",
    navSplit: "拆分 PDF",
    navCompress: "压缩 PDF",
    navConvert: "转换 PDF",
    navAllTools: "所有工具",
    navConvertTo: "转换为 PDF",
    navConvertFrom: "从 PDF 转换",
    trustTitle: "真正的零服务器隐私保护",
    trustSubtitle: "您的文档永远不会离开您的电脑或手机。所有处理均通过 WebAssembly 在本地完成。",
    trustLocal: "100% 本地处理",
    trustHttps: "HTTPS 安全连接",
    trustStandard: "兼容标准 PDF",
    footerProduct: "工具",
    footerPrivacy: "隐私",
    footerTools: "所有工具",
    footerSecurity: "本地安全",
    footerCopy: "© KivoPDF 2026 — 免费且私密的 PDF 工具",
    backToTools: "返回所有工具",
    privateBadge: "100% 私密：您的文件不会离开浏览器",
    selectPdf: "选择 PDF 文件",
    dropHint: "或将文件拖放到此处",
    processNow: "立即处理",
    processing: "处理中...",
    download: "下载",
    processAnother: "处理另一个文件",
    ready: "完成",
    catAll: "全部",
    catWorkflows: "工作流",
    catOrganize: "整理 PDF",
    catOptimize: "优化 PDF",
    catConvert: "转换 PDF",
    catEdit: "编辑 PDF",
    catSecurity: "PDF 安全",
    catIntelligence: "PDF 智能",
  },
  hi: {
    heroEyebrow: "100% मुफ़्त · ब्राउज़र में लोकल प्रोसेसिंग · 0 फ़ाइल अपलोड",
    heroTitle: "निजी, तेज़ और मुफ़्त PDF टूल",
    heroSubtitle: "बिना किसी खाते या सर्वर के सीधे अपने डिवाइस पर दस्तावेज़ मर्ज, स्प्लिट, कंप्रेस, रोटेट और कन्वर्ट करें।",
    searchPlaceholder: "टूल खोजें (मर्ज, साइन, OCR, Word...)",
    navMerge: "PDF मर्ज करें",
    navSplit: "PDF विभाजित करें",
    navCompress: "PDF कंप्रेस करें",
    navConvert: "PDF कन्वर्ट करें",
    navAllTools: "सभी टूल",
    navConvertTo: "PDF में बदलें",
    navConvertFrom: "PDF से बदलें",
    trustTitle: "बिना सर्वर के असली गोपनीयता",
    trustSubtitle: "आपके दस्तावेज़ कभी भी आपके डिवाइस से बाहर नहीं जाते। सभी कार्य WebAssembly द्वारा लोकल होते हैं।",
    trustLocal: "100% लोकल प्रोसेसिंग",
    trustHttps: "सुरक्षित HTTPS कनेक्शन",
    trustStandard: "मानक PDF संगत",
    footerProduct: "टूल",
    footerPrivacy: "गोपनीयता",
    footerTools: "सभी टूल",
    footerSecurity: "लोकल सुरक्षा",
    footerCopy: "© KivoPDF 2026 — मुफ़्त और निजी PDF टूल",
    backToTools: "सभी टूल पर वापस जाएं",
    privateBadge: "100% निजी: आपकी फ़ाइलें ब्राउज़र से बाहर नहीं जातीं",
    selectPdf: "PDF फ़ाइलें चुनें",
    dropHint: "या यहाँ खींचें और छोड़ें",
    processNow: "अभी प्रोसेस करें",
    processing: "प्रोसेस हो रहा है...",
    download: "डाउनलोड करें",
    processAnother: "दूसरी फ़ाइल प्रोसेस करें",
    ready: "तैयार",
    catAll: "सभी",
    catWorkflows: "वर्कफ़्लो",
    catOrganize: "PDF व्यवस्थित करें",
    catOptimize: "PDF अनुकूलित करें",
    catConvert: "PDF कन्वर्ट करें",
    catEdit: "PDF संपादित करें",
    catSecurity: "PDF सुरक्षा",
    catIntelligence: "PDF इंटेलिजेंस",
  },
  ar: {
    heroEyebrow: "مجاني 100% · معالجة محلية في المتصفح · 0 ملفات مرفوعة",
    heroTitle: "أدوات PDF خاصة وسريعة ومجانية",
    heroSubtitle: "ادمج وقسّم واضغط ودوّر ووقّع وحوّل المستندات مباشرة على جهازك بدون حسابات أو خوادم.",
    searchPlaceholder: "ابحث عن أداة (دمج، توقيع، OCR، Word...)",
    navMerge: "دمج PDF",
    navSplit: "تقسيم PDF",
    navCompress: "ضغط PDF",
    navConvert: "تحويل PDF",
    navAllTools: "جميع الأدوات",
    navConvertTo: "التحويل إلى PDF",
    navConvertFrom: "التحويل من PDF",
    trustTitle: "خصوصية حقيقية بدون خوادم",
    trustSubtitle: "لا تغادر مستنداتك جهازك أبدًا. تتم جميع العمليات محليًا عبر WebAssembly.",
    trustLocal: "معالجة محلية 100%",
    trustHttps: "اتصال HTTPS آمن",
    trustStandard: "متوافق مع معايير PDF",
    footerProduct: "الأدوات",
    footerPrivacy: "الخصوصية",
    footerTools: "جميع الأدوات",
    footerSecurity: "الأمان المحلي",
    footerCopy: "© KivoPDF 2026 — أدوات PDF مجانية وخاصة",
    backToTools: "العودة إلى جميع الأدوات",
    privateBadge: "خاص 100%: ملفاتك لا تغادر متصفحك أبدًا",
    selectPdf: "اختر ملفات PDF",
    dropHint: "أو اسحب وأفلت هنا",
    processNow: "معالجة الآن",
    processing: "جارٍ المعالجة...",
    download: "تنزيل",
    processAnother: "معالجة ملف آخر",
    ready: "جاهز",
    catAll: "الكل",
    catWorkflows: "سير العمل",
    catOrganize: "ترتيب PDF",
    catOptimize: "تحسين PDF",
    catConvert: "تحويل PDF",
    catEdit: "تعديل PDF",
    catSecurity: "أمان PDF",
    catIntelligence: "ذكاء PDF",
  },
  fr: {
    heroEyebrow: "100 % Gratuit · Traitement local dans votre navigateur · 0 fichier envoyé",
    heroTitle: "Outils PDF privés, rapides et gratuits",
    heroSubtitle: "Fusionnez, divisez, compressez, pivotez, signez et convertissez vos documents sur votre appareil sans compte ni serveur.",
    searchPlaceholder: "Rechercher un outil (fusionner, signer, OCR...)",
    navMerge: "Fusionner PDF",
    navSplit: "Diviser PDF",
    navCompress: "Compresser PDF",
    navConvert: "Convertir PDF",
    navAllTools: "Tous les outils",
    navConvertTo: "Convertir en PDF",
    navConvertFrom: "Convertir depuis PDF",
    trustTitle: "Confidentialité réelle sans serveur",
    trustSubtitle: "Vos documents ne quittent jamais votre appareil. Tout s'exécute localement via WebAssembly.",
    trustLocal: "100 % Traitement local",
    trustHttps: "Connexion HTTPS sécurisée",
    trustStandard: "Compatible PDF standard",
    footerProduct: "Outils",
    footerPrivacy: "Confidentialité",
    footerTools: "Tous les outils",
    footerSecurity: "Sécurité locale",
    footerCopy: "© KivoPDF 2026 — Outils PDF gratuits et privés",
    backToTools: "Retour à tous les outils",
    privateBadge: "100 % Privé : vos fichiers ne quittent jamais votre navigateur",
    selectPdf: "Sélectionner des fichiers PDF",
    dropHint: "ou glisser-déposer ici",
    processNow: "Traiter maintenant",
    processing: "Traitement...",
    download: "Télécharger",
    processAnother: "Traiter un autre fichier",
    ready: "Prêt",
    catAll: "Tous",
    catWorkflows: "Flux de travail",
    catOrganize: "Organiser PDF",
    catOptimize: "Optimiser PDF",
    catConvert: "Convertir PDF",
    catEdit: "Éditer PDF",
    catSecurity: "Sécurité PDF",
    catIntelligence: "PDF Intelligence",
  },
  pt: {
    heroEyebrow: "100% Gratuito · Processamento local no navegador · 0 arquivos enviados",
    heroTitle: "Ferramentas PDF privadas, rápidas e gratuitas",
    heroSubtitle: "Junte, divida, comprima, gire, assine e converta documentos diretamente no seu dispositivo sem contas nem servidores.",
    searchPlaceholder: "Buscar ferramenta (juntar, assinar, OCR...)",
    navMerge: "Juntar PDF",
    navSplit: "Dividir PDF",
    navCompress: "Comprimir PDF",
    navConvert: "Converter PDF",
    navAllTools: "Todas as ferramentas",
    navConvertTo: "Converter para PDF",
    navConvertFrom: "Converter de PDF",
    trustTitle: "Privacidade real sem servidores",
    trustSubtitle: "Seus documentos nunca saem do seu dispositivo. Todo o processamento ocorre localmente via WebAssembly.",
    trustLocal: "100% Processamento local",
    trustHttps: "Conexão segura HTTPS",
    trustStandard: "Compatível com PDF padrão",
    footerProduct: "Ferramentas",
    footerPrivacy: "Privacidade",
    footerTools: "Todas as ferramentas",
    footerSecurity: "Segurança local",
    footerCopy: "© KivoPDF 2026 — Ferramentas PDF gratuitas e privadas",
    backToTools: "Voltar para todas as ferramentas",
    privateBadge: "100% Privado: seus arquivos nunca saem do navegador",
    selectPdf: "Selecionar arquivos PDF",
    dropHint: "ou arraste e solte aqui",
    processNow: "Processar agora",
    processing: "Processando...",
    download: "Baixar",
    processAnother: "Processar outro arquivo",
    ready: "Pronto",
    catAll: "Todos",
    catWorkflows: "Fluxos de trabalho",
    catOrganize: "Organizar PDF",
    catOptimize: "Otimizar PDF",
    catConvert: "Converter PDF",
    catEdit: "Editar PDF",
    catSecurity: "Segurança PDF",
    catIntelligence: "PDF Intelligence",
  },
  de: {
    heroEyebrow: "100 % Kostenlos · Lokale Verarbeitung im Browser · 0 Uploads",
    heroTitle: "Private, schnelle und kostenlose PDF-Tools",
    heroSubtitle: "Fügen Sie Dokumente direkt auf Ihrem Gerät zusammen, teilen, komprimieren, drehen, signieren und konvertieren Sie sie ohne Konto.",
    searchPlaceholder: "Tool suchen (zusammenfügen, signieren, OCR...)",
    navMerge: "PDF zusammenfügen",
    navSplit: "PDF teilen",
    navCompress: "PDF komprimieren",
    navConvert: "PDF konvertieren",
    navAllTools: "Alle Tools",
    navConvertTo: "In PDF umwandeln",
    navConvertFrom: "Aus PDF umwandeln",
    trustTitle: "Echte Privatsphäre ohne Server",
    trustSubtitle: "Ihre Dokumente verlassen niemals Ihr Gerät. Alle Vorgänge laufen lokal über WebAssembly.",
    trustLocal: "100 % Lokale Verarbeitung",
    trustHttps: "Sichere HTTPS-Verbindung",
    trustStandard: "Standard-PDF-kompatibel",
    footerProduct: "Tools",
    footerPrivacy: "Datenschutz",
    footerTools: "Alle Tools",
    footerSecurity: "Lokale Sicherheit",
    footerCopy: "© KivoPDF 2026 — Kostenlose und private PDF-Tools",
    backToTools: "Zurück zu allen Tools",
    privateBadge: "100 % Privat: Ihre Dateien verlassen niemals Ihren Browser",
    selectPdf: "PDF-Dateien auswählen",
    dropHint: "oder hierher ziehen und ablegen",
    processNow: "Jetzt verarbeiten",
    processing: "Verarbeitung...",
    download: "Herunterladen",
    processAnother: "Weitere Datei verarbeiten",
    ready: "Fertig",
    catAll: "Alle",
    catWorkflows: "Workflows",
    catOrganize: "PDF organisieren",
    catOptimize: "PDF optimieren",
    catConvert: "PDF konvertieren",
    catEdit: "PDF bearbeiten",
    catSecurity: "PDF-Sicherheit",
    catIntelligence: "PDF Intelligence",
  },
};

interface LangContextVal {
  lang: LangCode;
  locale: string;
  setLang: (l: LangCode) => void;
  t: Translations;
}

const LangContext = createContext<LangContextVal>({
  lang: "es",
  locale: "es-ES",
  setLang: () => {},
  t: DICT.es,
});

function detectBrowserLang(): LangCode {
  if (typeof navigator === "undefined") return "es";
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of candidates) {
    if (!raw) continue;
    const base = raw.toLowerCase().split("-")[0] as LangCode;
    if (DICT[base]) return base;
  }
  return "es";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("es");

  useEffect(() => {
    const saved = localStorage.getItem("kivopdf_lang") as LangCode | null;
    if (saved && DICT[saved]) {
      setLangState(saved);
    } else {
      setLangState(detectBrowserLang());
    }
  }, []);

  const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = meta.locale;
    document.documentElement.dir = meta.dir === "rtl" ? "rtl" : "ltr";
  }, [meta]);

  const setLang = (next: LangCode) => {
    setLangState(next);
    localStorage.setItem("kivopdf_lang", next);
  };

  return (
    <LangContext.Provider value={{ lang, locale: meta.locale, setLang, t: DICT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
