import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AuthLink } from "./AuthLink";


const BASE =
  "group/btn relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-center text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-gold transition-[transform,translate,box-shadow] duration-300 ease-out [transform:translate3d(var(--gx,0px),var(--gy,0px),0)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-10px_color-mix(in_oklab,var(--gold)_75%,transparent)] active:translate-y-0 active:scale-[0.98] sm:text-sm";

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
      {children}
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1" />
    </>
  );
}

/** Efeito magnético: o botão acompanha levemente o ponteiro (só mouse). */
function magnet(e: MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget;
  if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
  el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
}
function unmagnet(e: MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.removeProperty("--gx");
  e.currentTarget.style.removeProperty("--gy");
}

/** Botão dourado padrão da homepage. Use `gated` para exigir login antes. */
export function GoldButton({
  href,
  gated = false,
  className = "",
  children,
}: {
  href: string;
  gated?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const cls = `${BASE} ${className}`;

  if (gated) {
    return (
      <AuthLink href={href} className={cls} onMouseMove={magnet} onMouseLeave={unmagnet}>
        <Inner>{children}</Inner>
      </AuthLink>
    );
  }

  return (
    <a
      href={href}
      className={cls}
      onMouseMove={magnet}
      onMouseLeave={unmagnet}
      onClick={(e) => {
        e.preventDefault();
        navigate({ href });
      }}
    >
      <Inner>{children}</Inner>
    </a>
  );
}

