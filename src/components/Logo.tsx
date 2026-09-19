import { cn } from "@/lib/utils";
import logoDark from "@/assets/pele-next-gen-logo.png";
import logoLight from "@/assets/pele-next-gen-logo-light.png";

/**
 * `variant="onDark"` fixa a versão para fundo escuro (sem alternância por tema) —
 * usado em superfícies que são sempre escuras independente do tema do site
 * (footer, header transparente sobre o vídeo do Hero).
 */
export function Logo({
  className,
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "onDark";
}) {
  if (variant === "onDark") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <img src={logoDark} alt="Pelé Next Gen" className="h-20 w-auto object-contain" />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img src={logoLight} alt="Pelé Next Gen" className="h-20 w-auto object-contain dark:hidden" />
      <img
        src={logoDark}
        alt="Pelé Next Gen"
        aria-hidden="true"
        className="hidden h-20 w-auto object-contain dark:block"
      />
    </div>
  );
}
