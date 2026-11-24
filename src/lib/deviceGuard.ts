export interface DeviceLimits {
  isMobileOrSafari: boolean;
  maxFileSizeMb: number;
  warningMessage: string | null;
}

export function getDeviceLimits(): DeviceLimits {
  if (typeof window === "undefined") {
    return { isMobileOrSafari: false, maxFileSizeMb: 150, warningMessage: null };
  }

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || isIOS;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowRam = typeof mem === "number" && mem <= 4;

  if (isIOS || isMobile || lowRam) {
    return {
      isMobileOrSafari: true,
      maxFileSizeMb: 25,
      warningMessage:
        "Modo móvil / Safari detectado: recomendamos archivos menores a 25 MB para evitar límites de memoria del navegador.",
    };
  }

  return { isMobileOrSafari: false, maxFileSizeMb: 150, warningMessage: null };
}
