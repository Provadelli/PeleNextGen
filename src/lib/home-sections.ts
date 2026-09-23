import type { MouseEvent as ReactMouseEvent } from "react";
import { smoothScrollTo } from "@/components/SmoothScroll";

export const SECTIONS = [
  { id: "proposito", label: "Propósito" },
  { id: "legado", label: "Legado" },
  { id: "academia", label: "Academia" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "peneiras", label: "Peneiras" },
  { id: "mapa", label: "Mapa" },
  { id: "parceiros", label: "Parceiros" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export const HEADER_OFFSET = 84;

export function scrollToSection(e: ReactMouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  smoothScrollTo(el, HEADER_OFFSET);
  window.history.replaceState(null, "", `#${id}`);
}
