export type ToolCategory =
  | "all"
  | "workflows"
  | "organize"
  | "optimize"
  | "convert"
  | "edit"
  | "security"
  | "intelligence";

export interface PdfTool {
  slug: string;
  title: string;
  description: string;
  category: Exclude<ToolCategory, "all">;
  color: string;
  bgColor: string;
  isNew?: boolean;
  clientSupported: boolean;
  ctaLabel?: string;
}

export const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "workflows", label: "Flujos de trabajo" },
  { id: "organize", label: "Ordenar PDF" },
  { id: "optimize", label: "Optimizar PDF" },
  { id: "convert", label: "Convertir PDF" },
  { id: "edit", label: "Editar PDF" },
  { id: "security", label: "Seguridad PDF" },
  { id: "intelligence", label: "PDF Intelligence" },
];

export const PDF_TOOLS: PdfTool[] = [
  {
    slug: "unir-pdf",
    title: "Unir PDF",
    description: "Une PDFs y ponlos en el orden que prefieras, rápido y sin esperas.",
    category: "organize",
    color: "#EE6C4D",
    bgColor: "#FCECE8",
    clientSupported: true,
  },
  {
    slug: "dividir-pdf",
    title: "Dividir PDF",
    description:
      "Extrae una o varias páginas de tu PDF o convierte cada página del PDF en un archivo PDF independiente.",
    category: "organize",
    color: "#EE6C4D",
    bgColor: "#FCECE8",
    clientSupported: true,
  },
  {
    slug: "comprimir-pdf",
    title: "Comprimir PDF",
    description:
      "Consigue que tu documento PDF pese menos y, al mismo tiempo, mantener la máxima calidad posible. Optimiza tus archivos PDF.",
    category: "optimize",
    color: "#8FBC5D",
    bgColor: "#EEF6E5",
    clientSupported: true,
  },
  {
    slug: "pdf-a-word",
    title: "PDF a Word",
    description: "Convierte fácilmente tus archivos PDF a DOCX de WORD editables.",
    category: "convert",
    color: "#5F83C6",
    bgColor: "#EBF0FA",
    clientSupported: true,
  },
  {
    slug: "pdf-a-powerpoint",
    title: "PDF a PowerPoint",
    description: "Convierte tus archivos PDF a presentaciones PPTX de POWERPOINT.",
    category: "convert",
    color: "#FF7651",
    bgColor: "#FFEDE8",
    clientSupported: true,
  },
  {
    slug: "pdf-a-excel",
    title: "PDF a Excel",
    description: "Extrae directamente datos de PDF a Excel en pocos segundos.",
    category: "convert",
    color: "#5EA162",
    bgColor: "#EAF5EB",
    clientSupported: true,
  },
  {
    slug: "word-a-pdf",
    title: "Word a PDF",
    description:
      "Convierte tus documentos WORD a PDF con la máxima calidad y exactamente igual que el archivo DOC o DOCX original.",
    category: "convert",
    color: "#5F83C6",
    bgColor: "#EBF0FA",
    clientSupported: true,
  },
  {
    slug: "powerpoint-a-pdf",
    title: "PowerPoint a PDF",
    description:
      "Convierte tus presentaciones POWERPOINT a PDF con la máxima calidad y exactamente igual que el archivo PPT o PPTX original.",
    category: "convert",
    color: "#FF7651",
    bgColor: "#FFEDE8",
    clientSupported: true,
  },
  {
    slug: "excel-a-pdf",
    title: "Excel a PDF",
    description:
      "Convierte tus tablas EXCEL a PDF con las columnas ajustadas al ancho de la página. Vertical u horizontal, tu escoges la orientación.",
    category: "convert",
    color: "#5EA162",
    bgColor: "#EAF5EB",
    clientSupported: true,
  },
  {
    slug: "editar-pdf",
    title: "Editar PDF",
    description:
      "Añadir texto, imágenes, formas o anotaciones a mano en el documento PDF. Editar el tamaño, fuente y color del contenido añadido.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    clientSupported: true,
  },
  {
    slug: "pdf-a-jpg",
    title: "PDF a JPG",
    description:
      "Extrae todas las imágenes que están dentro de un PDF o convierte cada página en una imagen JPG.",
    category: "convert",
    color: "#D6BF2D",
    bgColor: "#FBF7DC",
    clientSupported: true,
  },
  {
    slug: "jpg-a-pdf",
    title: "JPG a PDF",
    description:
      "Convierte tus imágenes JPG a PDF. Ajusta la orientación y los márgenes.",
    category: "convert",
    color: "#D6BF2D",
    bgColor: "#FBF7DC",
    clientSupported: true,
  },
  {
    slug: "firmar-pdf",
    title: "Firmar PDF",
    description: "Firma tu mismo o solicita firmas electrónicas de otros.",
    category: "security",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "marca-de-agua",
    title: "Marca de agua",
    description:
      "Elige una imagen o texto para insertarlo encima de un PDF. Elige posición, transparencia y tipografía.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    clientSupported: true,
  },
  {
    slug: "rotar-pdf",
    title: "Rotar PDF",
    description:
      "Rota tus PDF como quieras. Rota muchos documentos PDF a la vez.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    clientSupported: true,
  },
  {
    slug: "html-a-pdf",
    title: "HTML a PDF",
    description:
      "Convierte páginas web de HTML a PDF. Copia y pega la dirección de la página que quieres convertir a PDF.",
    category: "convert",
    color: "#D6BF2D",
    bgColor: "#FBF7DC",
    clientSupported: true,
  },
  {
    slug: "desbloquear-pdf",
    title: "Desbloquear PDF",
    description:
      "Quita la contraseña de los PDF y los desbloquea, así podrás usarlos para lo que quieras.",
    category: "security",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "proteger-pdf",
    title: "Proteger PDF",
    description:
      "Protege PDF con contraseña. Encripta archivos PDF para evitar accesos no autorizados.",
    category: "security",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "ordenar-pdf",
    title: "Ordenar PDF",
    description:
      "Ordena las páginas de tu PDF como quieras. Elimina o añade páginas PDF a tu documento según necesites.",
    category: "organize",
    color: "#EE6C4D",
    bgColor: "#FCECE8",
    clientSupported: true,
  },
  {
    slug: "pdf-a-pdfa",
    title: "PDF a PDF/A",
    description:
      "Transforma tu PDF a PDF/A, la versión ISO estandarizada de PDF para archivar a largo plazo. Tu PDF conservará el formato cuando accedas en el futuro.",
    category: "convert",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "reparar-pdf",
    title: "Reparar PDF",
    description:
      "Repara PDF dañados y recupera datos de PDF corruptos. Arregla PDFs con nuestra herramienta de reparación.",
    category: "optimize",
    color: "#8FBC5D",
    bgColor: "#EEF6E5",
    clientSupported: true,
  },
  {
    slug: "numeros-de-pagina",
    title: "Números de página",
    description:
      "Añade números de página a un PDF. Escoge posición, dimensiones, formato y tipografía.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    clientSupported: true,
  },
  {
    slug: "escanea-a-pdf",
    title: "Escanea a PDF",
    description:
      "Captura escaneos de documentos desde tu dispositivo móvil y envíalos instantáneamente a tu navegador.",
    category: "organize",
    color: "#EE6C4D",
    bgColor: "#FCECE8",
    clientSupported: true,
  },
  {
    slug: "ocr-pdf",
    title: "OCR PDF",
    description:
      "Convierte fácilmente PDF escaneados en documentos PDF con texto seleccionable.",
    category: "optimize",
    color: "#8FBC5D",
    bgColor: "#EEF6E5",
    clientSupported: true,
  },
  {
    slug: "comparar-pdf",
    title: "Comparar PDF",
    description:
      "Compara dos archivos simultáneamente para ver las diferencias entre ambas versiones.",
    category: "security",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "censurar-pdf",
    title: "Censurar PDF",
    description:
      "Censura el texto y los gráficos de un PDF para eliminar permanentemente la información sensible.",
    category: "security",
    color: "#4A7AAB",
    bgColor: "#E8EFF7",
    clientSupported: true,
  },
  {
    slug: "recortar-pdf",
    title: "Recortar PDF",
    description:
      "Elimina los márgenes de tus documentos PDF o selecciona un área específica para aplicar los cambios a una página concreta o a todo el documento.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    clientSupported: true,
  },
  {
    slug: "formularios-pdf",
    title: "Formularios PDF",
    description:
      "Detecta automáticamente los campos de los formularios, crea PDFs interactivos y rellenables, o completa formularios PDF.",
    category: "edit",
    color: "#AB6993",
    bgColor: "#F5EAF1",
    isNew: true,
    clientSupported: true,
  },
  {
    slug: "resumir-con-ia",
    title: "Resumir con IA",
    description:
      "Genera resúmenes claros y concisos a partir de artículos, párrafos y trabajos e identifica los puntos clave con precisión en segundos.",
    category: "intelligence",
    color: "#7253E2",
    bgColor: "#EFEBFD",
    isNew: true,
    clientSupported: true,
  },
  {
    slug: "traducir-pdf",
    title: "Traducir PDF",
    description:
      "Traduce fácilmente archivos PDF con IA. Conserva intacta la fuente, la disposición de la página y el formato.",
    category: "intelligence",
    color: "#7253E2",
    bgColor: "#EFEBFD",
    isNew: true,
    clientSupported: true,
  },
  {
    slug: "pdf-a-markdown",
    title: "PDF a Markdown",
    description:
      "Convierte PDFs a archivos Markdown fácilmente. Ideal para notas, documentos y LLMs. Conserva encabezados, tablas, listas y enlaces.",
    category: "intelligence",
    color: "#7253E2",
    bgColor: "#EFEBFD",
    isNew: true,
    clientSupported: true,
  },
  {
    slug: "flujos-de-trabajo",
    title: "Crea un flujo de trabajo",
    description:
      "Crea flujos de trabajo personalizados con tus herramientas favoritas y automatiza tareas para reutilizarlas en cualquier momento.",
    category: "workflows",
    color: "#33333B",
    bgColor: "#EAEAEF",
    ctaLabel: "Crear un flujo de trabajo",
    clientSupported: true,
  },
];

export function getToolSeo(tool: PdfTool) {
  return {
    title: `${tool.title} Online Gratis y 100% Privado | KivoPDF`,
    description: `${tool.description} Procesamiento local en tu navegador sin subir archivos a servidores.`,
    paragraphs: [
      `${tool.title} en KivoPDF te permite trabajar directamente desde tu navegador sin enviar tus documentos a servidores externos. Todo el procesamiento se ejecuta localmente en tu dispositivo para garantizar privacidad total.`,
      `Compatible con ordenadores y dispositivos móviles, sin registros obligatorios ni marcas de agua ocultas. Selecciona tus archivos, ajusta las opciones y descarga el resultado al instante.`,
    ],
    faqs: [
      {
        q: `¿Es seguro usar ${tool.title} en KivoPDF?`,
        a: `Sí. Tus archivos nunca abandonan tu dispositivo; el procesamiento ocurre localmente en tu navegador.`,
      },
      {
        q: `¿Tiene algún coste o límite de uso?`,
        a: `Es gratuito y funciona sin necesidad de crear cuenta ni instalar programas adicionales.`,
      },
      {
        q: `¿Funciona en Mac, Windows y móvil?`,
        a: `Sí, KivoPDF es compatible con cualquier navegador moderno en escritorio y dispositivos móviles.`,
      },
    ],
  };
}

export const MEGA_MENU_GROUPS = [
  {
    title: "Ordenar PDF",
    items: [
      { label: "Unir PDF", slug: "unir-pdf", color: "#EE6C4D" },
      { label: "Dividir PDF", slug: "dividir-pdf", color: "#EE6C4D" },
      { label: "Ordenar PDF", slug: "ordenar-pdf", color: "#EE6C4D" },
      { label: "Escanea a PDF", slug: "escanea-a-pdf", color: "#EE6C4D" },
    ],
  },
  {
    title: "Optimizar PDF",
    items: [
      { label: "Comprimir PDF", slug: "comprimir-pdf", color: "#8FBC5D" },
      { label: "Reparar PDF", slug: "reparar-pdf", color: "#8FBC5D" },
      { label: "OCR PDF", slug: "ocr-pdf", color: "#8FBC5D" },
    ],
  },
  {
    title: "Convertir a PDF",
    items: [
      { label: "JPG a PDF", slug: "jpg-a-pdf", color: "#D6BF2D" },
      { label: "WORD a PDF", slug: "word-a-pdf", color: "#5F83C6" },
      { label: "POWERPOINT a PDF", slug: "powerpoint-a-pdf", color: "#FF7651" },
      { label: "EXCEL a PDF", slug: "excel-a-pdf", color: "#5EA162" },
      { label: "HTML a PDF", slug: "html-a-pdf", color: "#D6BF2D" },
    ],
  },
  {
    title: "Convertir desde PDF",
    items: [
      { label: "PDF a JPG", slug: "pdf-a-jpg", color: "#D6BF2D" },
      { label: "PDF a WORD", slug: "pdf-a-word", color: "#5F83C6" },
      { label: "PDF a POWERPOINT", slug: "pdf-a-powerpoint", color: "#FF7651" },
      { label: "PDF a EXCEL", slug: "pdf-a-excel", color: "#5EA162" },
      { label: "PDF a PDF/A", slug: "pdf-a-pdfa", color: "#4A7AAB" },
    ],
  },
  {
    title: "Editar PDF",
    items: [
      { label: "Rotar PDF", slug: "rotar-pdf", color: "#AB6993" },
      { label: "Números de página", slug: "numeros-de-pagina", color: "#AB6993" },
      { label: "Marca de agua", slug: "marca-de-agua", color: "#AB6993" },
      { label: "Recortar PDF", slug: "recortar-pdf", color: "#AB6993" },
      { label: "Editar PDF", slug: "editar-pdf", color: "#AB6993" },
      { label: "Formularios PDF", slug: "formularios-pdf", color: "#AB6993" },
    ],
  },
  {
    title: "Seguridad de PDF",
    items: [
      { label: "Desbloquear PDF", slug: "desbloquear-pdf", color: "#4A7AAB" },
      { label: "Proteger PDF", slug: "proteger-pdf", color: "#4A7AAB" },
      { label: "Firmar PDF", slug: "firmar-pdf", color: "#4A7AAB" },
      { label: "Censurar PDF", slug: "censurar-pdf", color: "#4A7AAB" },
      { label: "Comparar PDF", slug: "comparar-pdf", color: "#4A7AAB" },
    ],
  },
  {
    title: "PDF Intelligence",
    items: [
      { label: "Resumir con IA", slug: "resumir-con-ia", color: "#7253E2" },
      { label: "Traducir PDF", slug: "traducir-pdf", color: "#7253E2" },
      { label: "PDF a Markdown", slug: "pdf-a-markdown", color: "#7253E2" },
    ],
  },
];
