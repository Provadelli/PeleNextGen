import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

type RevealVariant = "up" | "left" | "right" | "scale" | "mask";

const HIDDEN: Record<RevealVariant, string> = {
  up: "translate-y-6 opacity-0 blur-[2px]",
  left: "-translate-x-10 opacity-0 blur-[2px]",
  right: "translate-x-10 opacity-0 blur-[2px]",
  scale: "scale-[0.94] opacity-0 blur-[3px]",
  mask: "translate-y-[0.6em] opacity-0",
};

/**
 * Revela conteúdo ao entrar em viewport.
 * Com `immediate`, revela logo na montagem (animação de abertura da página).
 * `variant` escolhe o movimento; `stagger` faz os filhos diretos entrarem em cascata.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  immediate = false,
  variant = "up",
  stagger = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "ul" | "ol";
  immediate?: boolean;
  variant?: RevealVariant;
  stagger?: boolean;
} & Record<string, unknown>) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!immediate) return;
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, [immediate]);

  const visible = immediate ? mounted : shown;

  return (
    <Tag
      ref={ref as never}
      data-shown={visible}
      style={{ transitionDelay: `${delay}ms`, ["--reveal-delay" as string]: `${delay}ms` }}
      className={cn(
        stagger
          ? "reveal-stagger"
          : [
              "transition-[opacity,transform,filter,clip-path] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              variant === "mask" && "reveal-mask",
              visible ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0" : HIDDEN[variant],
            ],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** `as="h2"` quando o eyebrow é o único título da seção (hierarquia de headings). */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "h2";
}) {
  return (
    <Tag
      className={cn(
        // gold-ink: o dourado de marca não passa 4.5:1 em texto pequeno sobre fundo claro.
        "flex items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[0.32em] text-gold-ink",
        className,
      )}
    >
      <span aria-hidden="true" className="eyebrow-line h-px w-8 bg-primary/70" />
      {children}
    </Tag>
  );
}

/** Botão dourado com brilho corrido no hover (desenho clássico da marca). */
export function GoldButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      {children}
    </span>
  );
}
