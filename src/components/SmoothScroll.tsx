import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import Lenis from "lenis";

/** Instância global — `null` em reduced-motion, toque ou antes da hidratação. */
let lenis: Lenis | null = null;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Rola até um alvo (px ou elemento) usando a rolagem suave quando ativa.
 * `offset` desconta o header fixo.
 */
export function smoothScrollTo(target: number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -offset, duration: 1.3 });
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReduced() ? "auto" : "smooth" });
}

/**
 * Rolagem com inércia na roda do mouse (Lenis) + barra de progresso dourada no topo.
 * Desligada em telas de toque (rolagem nativa já é fluida) e em reduced-motion.
 */
export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || prefersReduced()) return;

    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      // Áreas com rolagem própria (modais, listas, menus) continuam nativas.
      prevent: (node) =>
        node.closest?.("[data-lenis-prevent], [role='dialog'], [data-radix-scroll-area-viewport]") !=
        null,
    });
    lenis = instance;

    let raf = 0;
    const loop = (t: number) => {
      instance.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Troca de página: descarta a inércia pendente para não "arrastar" a rolagem
  // da página anterior (o router cuida da posição, inclusive de #âncoras).
  useEffect(() => {
    lenis?.stop();
    lenis?.start();
  }, [pathname]);

  return <div aria-hidden="true" className="scroll-progress" />;
}
