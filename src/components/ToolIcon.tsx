import {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Presentation,
  Sheet,
  Edit3,
  Image as ImageIcon,
  PenTool,
  Stamp,
  RotateCw,
  Globe,
  Unlock,
  Lock,
  ArrowUpDown,
  Archive,
  Wrench,
  Hash,
  ScanLine,
  ScanText,
  GitCompare,
  EyeOff,
  Crop,
  ClipboardList,
  Sparkles,
  Languages,
  FileCode,
  Workflow,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "unir-pdf": Combine,
  "dividir-pdf": Scissors,
  "comprimir-pdf": Minimize2,
  "pdf-a-word": FileText,
  "pdf-a-powerpoint": Presentation,
  "pdf-a-excel": Sheet,
  "word-a-pdf": FileText,
  "powerpoint-a-pdf": Presentation,
  "excel-a-pdf": Sheet,
  "editar-pdf": Edit3,
  "pdf-a-jpg": ImageIcon,
  "jpg-a-pdf": ImageIcon,
  "firmar-pdf": PenTool,
  "marca-de-agua": Stamp,
  "rotar-pdf": RotateCw,
  "html-a-pdf": Globe,
  "desbloquear-pdf": Unlock,
  "proteger-pdf": Lock,
  "ordenar-pdf": ArrowUpDown,
  "pdf-a-pdfa": Archive,
  "reparar-pdf": Wrench,
  "numeros-de-pagina": Hash,
  "escanea-a-pdf": ScanLine,
  "ocr-pdf": ScanText,
  "comparar-pdf": GitCompare,
  "censurar-pdf": EyeOff,
  "recortar-pdf": Crop,
  "formularios-pdf": ClipboardList,
  "resumir-con-ia": Sparkles,
  "traducir-pdf": Languages,
  "pdf-a-markdown": FileCode,
  "flujos-de-trabajo": Workflow,
};

export default function ToolIcon({
  slug,
  color,
  bgColor,
  size = "md",
}: {
  slug: string;
  color: string;
  bgColor: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICON_MAP[slug] || FileText;
  const boxClass =
    size === "sm"
      ? "w-7 h-7 rounded-md"
      : size === "lg"
        ? "w-14 h-14 rounded-2xl"
        : "w-12 h-12 rounded-xl";
  const iconClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-6 h-6";

  return (
    <div
      className={`${boxClass} flex items-center justify-center shrink-0 transition-colors duration-150`}
      style={{ backgroundColor: bgColor, color }}
    >
      <Icon className={iconClass} strokeWidth={1.5} />
    </div>
  );
}
