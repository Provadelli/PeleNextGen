import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { AuthLink } from "./AuthLink";
import { cn } from "@/lib/utils";

/**
 * "Ver todas" padrão da home: contorno discreto que vira pílula dourada no hover,
 * com brilho correndo e seta que sobe — altura e padding fixos para ficar bem enquadrado.
 * `onDark` ajusta o contorno/texto para superfícies escuras (ex.: card do Hero).
 */
export function VerTodasLink({
  href = "/peneiras",
  onDark = false,
  className,
  children = "Ver todas",
}: {
  href?: string;
  onDark?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <AuthLink
      href={href}
      className={cn(
        "group/vt relative inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border px-6 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-gold active:translate-y-0 active:scale-[0.98] sm:text-xs",
        onDark ? "border-white/30 text-white" : "border-border text-foreground",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/vt:translate-x-full" />
      <span className="relative">{children}</span>
      <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover/vt:-translate-y-0.5 group-hover/vt:translate-x-0.5" />
    </AuthLink>
  );
}
