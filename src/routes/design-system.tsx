import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DSSection } from "@/components/design-system/DSSection";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design System — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Styleguide do Pelé Next Gen: tokens, tipografia, componentes em todos os estados e padrões de interface.",
      },
    ],
  }),
  component: DesignSystemPage,
});

const SECTIONS = [
  { id: "tokens", label: "Tokens" },
  { id: "tipografia", label: "Tipografia" },
  { id: "componentes", label: "Componentes" },
  { id: "padroes", label: "Padrões" },
  { id: "estados", label: "Estados" },
] as const;

function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            aria-label="Pelé Next Gen — voltar ao início"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <Logo className="[&_img]:h-10" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-ink">
            Sprint 4 · Styleguide
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Design System</h1>
          <p className="max-w-2xl text-muted-foreground">
            Tokens, tipografia e componentes reais do Pelé Next Gen, nos estados que a interface
            usa. Tudo é renderizado com Tailwind CSS e as variáveis de <code>src/styles.css</code>.
          </p>
        </div>

        <nav
          aria-label="Seções do design system"
          className="sticky top-0 z-40 -mx-4 mt-6 border-b border-border bg-background/90 px-4 backdrop-blur sm:-mx-6 sm:px-6"
        >
          <ul className="flex flex-wrap gap-x-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main id="conteudo" className="mt-10 space-y-16">
          <DSSection id="tokens" title="Tokens" intro="Cores, espaçamento, raios e sombras lidos das variáveis CSS." />
          <DSSection id="tipografia" title="Tipografia" intro="Escala tipográfica usada no site." />
          <DSSection id="componentes" title="Componentes" intro="Componentes reais de src/components." />
          <DSSection id="padroes" title="Padrões" intro="Composições recorrentes entre as telas." />
          <DSSection id="estados" title="Estados" intro="Carregando, vazio, erro e sucesso." />
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <p>Pelé Next Gen · Design System (Sprint 4)</p>
          <p>Documentação: docs/design-system.md</p>
        </div>
      </footer>
    </div>
  );
}
