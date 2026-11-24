import type { LangCode } from "./i18n";
import type { PdfTool } from "@/data/tools";

type ToolCopy = { title: string; description: string };

const TOOL_TITLES: Record<string, Record<LangCode, string>> = {
  "unir-pdf": { es: "Unir PDF", en: "Merge PDF", zh: "合并 PDF", hi: "PDF मर्ज करें", ar: "دمج PDF", fr: "Fusionner PDF", pt: "Juntar PDF", de: "PDF zusammenfügen" },
  "dividir-pdf": { es: "Dividir PDF", en: "Split PDF", zh: "拆分 PDF", hi: "PDF विभाजित करें", ar: "تقسيم PDF", fr: "Diviser PDF", pt: "Dividir PDF", de: "PDF teilen" },
  "comprimir-pdf": { es: "Comprimir PDF", en: "Compress PDF", zh: "压缩 PDF", hi: "PDF कंप्रेस करें", ar: "ضغط PDF", fr: "Compresser PDF", pt: "Comprimir PDF", de: "PDF komprimieren" },
  "pdf-a-word": { es: "PDF a Word", en: "PDF to Word", zh: "PDF 转 Word", hi: "PDF से Word", ar: "PDF إلى Word", fr: "PDF en Word", pt: "PDF para Word", de: "PDF in Word" },
  "pdf-a-powerpoint": { es: "PDF a PowerPoint", en: "PDF to PowerPoint", zh: "PDF 转 PPT", hi: "PDF से PowerPoint", ar: "PDF إلى PowerPoint", fr: "PDF en PowerPoint", pt: "PDF para PowerPoint", de: "PDF in PowerPoint" },
  "pdf-a-excel": { es: "PDF a Excel", en: "PDF to Excel", zh: "PDF 转 Excel", hi: "PDF से Excel", ar: "PDF إلى Excel", fr: "PDF en Excel", pt: "PDF para Excel", de: "PDF in Excel" },
  "word-a-pdf": { es: "Word a PDF", en: "Word to PDF", zh: "Word 转 PDF", hi: "Word से PDF", ar: "Word إلى PDF", fr: "Word en PDF", pt: "Word para PDF", de: "Word in PDF" },
  "powerpoint-a-pdf": { es: "PowerPoint a PDF", en: "PowerPoint to PDF", zh: "PPT 转 PDF", hi: "PowerPoint से PDF", ar: "PowerPoint إلى PDF", fr: "PowerPoint en PDF", pt: "PowerPoint para PDF", de: "PowerPoint in PDF" },
  "excel-a-pdf": { es: "Excel a PDF", en: "Excel to PDF", zh: "Excel 转 PDF", hi: "Excel से PDF", ar: "Excel إلى PDF", fr: "Excel en PDF", pt: "Excel para PDF", de: "Excel in PDF" },
  "editar-pdf": { es: "Editar PDF", en: "Edit PDF", zh: "编辑 PDF", hi: "PDF संपादित करें", ar: "تعديل PDF", fr: "Éditer PDF", pt: "Editar PDF", de: "PDF bearbeiten" },
  "pdf-a-jpg": { es: "PDF a JPG", en: "PDF to JPG", zh: "PDF 转 JPG", hi: "PDF से JPG", ar: "PDF إلى JPG", fr: "PDF en JPG", pt: "PDF para JPG", de: "PDF in JPG" },
  "jpg-a-pdf": { es: "JPG a PDF", en: "JPG to PDF", zh: "JPG 转 PDF", hi: "JPG से PDF", ar: "JPG إلى PDF", fr: "JPG en PDF", pt: "JPG para PDF", de: "JPG in PDF" },
  "firmar-pdf": { es: "Firmar PDF", en: "Sign PDF", zh: "签名 PDF", hi: "PDF साइन करें", ar: "توقيع PDF", fr: "Signer PDF", pt: "Assinar PDF", de: "PDF signieren" },
  "marca-de-agua": { es: "Marca de agua", en: "Watermark", zh: "添加水印", hi: "वॉटरमार्क", ar: "علامة مائية", fr: "Filigrane", pt: "Marca d'água", de: "Wasserzeichen" },
  "rotar-pdf": { es: "Rotar PDF", en: "Rotate PDF", zh: "旋转 PDF", hi: "PDF घुमाएं", ar: "تدوير PDF", fr: "Pivoter PDF", pt: "Girar PDF", de: "PDF drehen" },
  "html-a-pdf": { es: "HTML a PDF", en: "HTML to PDF", zh: "HTML 转 PDF", hi: "HTML से PDF", ar: "HTML إلى PDF", fr: "HTML en PDF", pt: "HTML para PDF", de: "HTML in PDF" },
  "desbloquear-pdf": { es: "Desbloquear PDF", en: "Unlock PDF", zh: "解锁 PDF", hi: "PDF अनलॉक करें", ar: "إلغاء قفل PDF", fr: "Déverrouiller PDF", pt: "Desbloquear PDF", de: "PDF entsperren" },
  "proteger-pdf": { es: "Proteger PDF", en: "Protect PDF", zh: "保护 PDF", hi: "PDF सुरक्षित करें", ar: "حماية PDF", fr: "Protéger PDF", pt: "Proteger PDF", de: "PDF schützen" },
  "ordenar-pdf": { es: "Ordenar PDF", en: "Organize PDF", zh: "整理 PDF", hi: "PDF व्यवस्थित करें", ar: "ترتيب PDF", fr: "Organiser PDF", pt: "Organizar PDF", de: "PDF organisieren" },
  "pdf-a-pdfa": { es: "PDF a PDF/A", en: "PDF to PDF/A", zh: "PDF 转 PDF/A", hi: "PDF से PDF/A", ar: "PDF إلى PDF/A", fr: "PDF en PDF/A", pt: "PDF para PDF/A", de: "PDF in PDF/A" },
  "reparar-pdf": { es: "Reparar PDF", en: "Repair PDF", zh: "修复 PDF", hi: "PDF सुधारें", ar: "إصلاح PDF", fr: "Réparer PDF", pt: "Reparar PDF", de: "PDF reparieren" },
  "numeros-de-pagina": { es: "Números de página", en: "Page numbers", zh: "添加页码", hi: "पृष्ठ संख्या", ar: "أرقام الصفحات", fr: "Numéros de page", pt: "Números de página", de: "Seitenzahlen" },
  "escanea-a-pdf": { es: "Escanea a PDF", en: "Scan to PDF", zh: "扫描转 PDF", hi: "स्कैन से PDF", ar: "مسح إلى PDF", fr: "Scanner en PDF", pt: "Digitalizar para PDF", de: "Scannen in PDF" },
  "ocr-pdf": { es: "OCR PDF", en: "OCR PDF", zh: "OCR 识别", hi: "OCR PDF", ar: "OCR PDF", fr: "OCR PDF", pt: "OCR PDF", de: "OCR PDF" },
  "comparar-pdf": { es: "Comparar PDF", en: "Compare PDF", zh: "对比 PDF", hi: "PDF तुलना करें", ar: "مقارنة PDF", fr: "Comparer PDF", pt: "Comparar PDF", de: "PDF vergleichen" },
  "censurar-pdf": { es: "Censurar PDF", en: "Redact PDF", zh: "涂黑隐私", hi: "PDF छिपाएं", ar: "تنقيح PDF", fr: "Biffer PDF", pt: "Ocultar PDF", de: "PDF schwärzen" },
  "recortar-pdf": { es: "Recortar PDF", en: "Crop PDF", zh: "裁剪 PDF", hi: "PDF क्रॉप करें", ar: "قص PDF", fr: "Recadrer PDF", pt: "Recortar PDF", de: "PDF zuschneiden" },
  "formularios-pdf": { es: "Formularios PDF", en: "PDF Forms", zh: "PDF 表单", hi: "PDF फ़ॉर्म", ar: "نماذج PDF", fr: "Formulaires PDF", pt: "Formulários PDF", de: "PDF-Formulare" },
  "resumir-con-ia": { es: "Resumir con IA", en: "AI Summarize", zh: "AI 摘要", hi: "AI सारांश", ar: "تلخيص بالذكاء الاصطناعي", fr: "Résumer avec IA", pt: "Resumir com IA", de: "KI-Zusammenfassung" },
  "traducir-pdf": { es: "Traducir PDF", en: "Translate PDF", zh: "AI 翻译 PDF", hi: "PDF अनुवाद करें", ar: "ترجمة PDF", fr: "Traduire PDF", pt: "Traduzir PDF", de: "PDF übersetzen" },
  "pdf-a-markdown": { es: "PDF a Markdown", en: "PDF to Markdown", zh: "PDF 转 Markdown", hi: "PDF से Markdown", ar: "PDF إلى Markdown", fr: "PDF en Markdown", pt: "PDF para Markdown", de: "PDF in Markdown" },
  "flujos-de-trabajo": { es: "Flujos de trabajo", en: "Workflows", zh: "工作流", hi: "वर्कफ़्लो", ar: "سير العمل", fr: "Flux de travail", pt: "Fluxos de trabalho", de: "Workflows" },
};

const TOOL_DESC_TEMPLATE: Record<LangCode, (title: string) => string> = {
  es: (t) => `${t} gratis y 100 % privado directamente en tu navegador.`,
  en: (t) => `${t} for free and 100% privately right in your browser.`,
  zh: (t) => `在浏览器中免费且 100% 私密地使用「${t}」。`,
  hi: (t) => `सीधे अपने ब्राउज़र में मुफ़्त और 100% निजी रूप से ${t} उपयोग करें।`,
  ar: (t) => `استخدم ${t} مجانًا وبخصوصية 100% مباشرة في متصفحك.`,
  fr: (t) => `${t} gratuitement et de façon 100 % privée dans votre navigateur.`,
  pt: (t) => `${t} grátis e 100% privado diretamente no seu navegador.`,
  de: (t) => `${t} kostenlos und zu 100 % privat direkt im Browser.`,
};

export function getToolCopy(tool: PdfTool, lang: LangCode): ToolCopy {
  if (lang === "es") {
    return { title: tool.title, description: tool.description };
  }
  const title = TOOL_TITLES[tool.slug]?.[lang] || tool.title;
  return {
    title,
    description: TOOL_DESC_TEMPLATE[lang](title),
  };
}
