/** Converte qualquer cor CSS (oklch, color-mix, rgb…) em sRGB usando um canvas 2D. */
export type RGBA = { r: number; g: number; b: number; a: number };

let ctx: CanvasRenderingContext2D | null = null;

export function toRGBA(color: string): RGBA | null {
  if (typeof document === "undefined") return null;
  if (!ctx) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: a / 255 };
}

export function toHex({ r, g, b }: RGBA): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function luminance({ r, g, b }: RGBA): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Razão de contraste WCAG 2.1 entre duas cores opacas. */
export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
