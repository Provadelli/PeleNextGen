import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BackLink } from "./BackLink";
import { cn } from "@/lib/utils";

/**
 * Casca das páginas de cadastro: `<main>` centralizado, link de voltar,
 * logo e cabeçalho com o único `<h1>` da página.
 */
export function AuthShell({
  backTo = "/login",
  backLabel = "Voltar ao login",
  icon,
  eyebrow,
  title,
  description,
  size = "md",
  children,
}: {
  backTo?: LinkProps["to"];
  backLabel?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  return (
    <main
      id="conteudo"
      className="flex min-h-screen justify-center bg-background px-4 py-8 sm:items-center sm:px-6 sm:py-12"
    >
      <div className={cn("w-full min-w-0", size === "lg" ? "max-w-3xl" : "max-w-md")}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackLink to={backTo}>{backLabel}</BackLink>
          <Link
            to="/"
            aria-label="Ir para a página inicial"
            className="inline-block w-fit rounded-md transition-opacity hover:opacity-80 active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo />
          </Link>
        </div>

        <div
          className={cn(
            size === "lg" && "rounded-3xl border border-border bg-card p-5 shadow-card sm:p-10",
          )}
        >
          <AuthHeader icon={icon} eyebrow={eyebrow} title={title} description={description} />
          {children}
        </div>
      </div>
    </main>
  );
}

/** Cabeçalho (ícone/selo + `<h1>` + descrição) compartilhado pelo login e cadastros. */
export function AuthHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 flex items-start gap-3">
      {Icon && (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </header>
  );
}
