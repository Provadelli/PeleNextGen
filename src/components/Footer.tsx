import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SECTIONS, scrollToSection } from "@/lib/home-sections";
import { smoothScrollTo } from "@/components/SmoothScroll";

/** Link do footer com sublinhado dourado que cresce no hover. */
function FooterLink({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 group-hover/fl:after:scale-x-100">
      {children}
    </span>
  );
}

const linkCls =
  "group/fl text-sm text-ink-foreground/65 transition-colors duration-300 hover:text-primary";

function Coluna({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">{titulo}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

export function Footer() {
  const voltarAoTopo = () => {
    smoothScrollTo(0);
  };

  return (
    <footer className="relative overflow-hidden border-t border-primary/20 bg-ink text-ink-foreground">
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:px-10">
        <div className="max-w-xs sm:col-span-2 lg:col-span-1">
          <Link
            to="/"
            aria-label="Pelé Next Gen — página inicial"
            onClick={() => window.location.pathname === "/" && smoothScrollTo(0)}
            className="inline-block transition-opacity hover:opacity-80"
          >
            <Logo variant="onDark" className="[&_img]:h-14" />
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-ink-foreground/60">
            A plataforma de peneiras que leva a oportunidade até o talento — avaliação profissional
            e um histórico real da sua evolução no futebol.
          </p>
          <a
            href="mailto:pelenextgen@hotmail.com"
            className="group/fl mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-foreground/80 transition-colors hover:text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover/fl:border-primary group-hover/fl:bg-primary group-hover/fl:text-primary-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <FooterLink>pelenextgen@hotmail.com</FooterLink>
          </a>
        </div>

        <Coluna titulo="Plataforma">
          {SECTIONS.slice(0, 5).map((s) => (
            <li key={s.id}>
              <a href={`/#${s.id}`} onClick={(e) => scrollToSection(e, s.id)} className={linkCls}>
                <FooterLink>{s.label}</FooterLink>
              </a>
            </li>
          ))}
        </Coluna>

        <Coluna titulo="Para atletas">
          <li>
            <Link to="/cadastro" className={linkCls}>
              <FooterLink>Criar conta</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/peneiras" className={linkCls}>
              <FooterLink>Peneiras abertas</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/ranking" className={linkCls}>
              <FooterLink>Ranking</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/manual" className={linkCls}>
              <FooterLink>Manual do atleta</FooterLink>
            </Link>
          </li>
        </Coluna>

        <Coluna titulo="Para clubes">
          <li>
            <Link to="/registro-clube" className={linkCls}>
              <FooterLink>Cadastrar clube</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/clubes" className={linkCls}>
              <FooterLink>Atletas aprovados</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/registro-admin" className={linkCls}>
              <FooterLink>Sou olheiro</FooterLink>
            </Link>
          </li>
        </Coluna>

        <Coluna titulo="Legal">
          <li>
            <Link to="/privacidade" className={linkCls}>
              <FooterLink>Privacidade</FooterLink>
            </Link>
          </li>
          <li>
            <Link to="/termos" className={linkCls}>
              <FooterLink>Termos de uso</FooterLink>
            </Link>
          </li>
        </Coluna>
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-4 border-t border-white/10 px-6 py-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© {new Date().getFullYear()} Pelé Next Gen — A plataforma de peneiras.</p>
        <button
          type="button"
          onClick={voltarAoTopo}
          className="group inline-flex items-center gap-2 self-start font-semibold uppercase tracking-[0.16em] text-ink-foreground/70 transition-colors hover:text-primary sm:self-auto"
        >
          Voltar ao topo
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUp className="h-4 w-4" />
          </span>
        </button>
      </div>
    </footer>
  );
}
