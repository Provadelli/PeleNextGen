import { Link } from "@tanstack/react-router";
import logoInk from "@/assets/pele-next-gen-logo.png";
import { Logo } from "@/components/Logo";
import { SECTIONS, scrollToSection } from "@/lib/home-sections";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-ink text-ink-foreground">
      <img
        src={logoInk}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.05]"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div className="max-w-xs">
          <Logo variant="onDark" className="[&_img]:h-14" />
          <p className="mt-4 text-xs leading-relaxed text-ink-foreground/60">
            Peneiras oficiais, avaliação profissional e um histórico real da sua evolução dentro do
            futebol.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => scrollToSection(e, s.id)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground/60 transition-colors hover:text-primary"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground/60">
          <Link to="/privacidade" className="transition-colors hover:text-primary">
            Privacidade
          </Link>
          <Link to="/termos" className="transition-colors hover:text-primary">
            Termos de uso
          </Link>
          <a
            href="mailto:suportepelenextgen@hotmail.com"
            className="transition-colors hover:text-primary"
          >
            Fale conosco
          </a>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-white/10 px-6 pb-10 pt-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© {new Date().getFullYear()} Pelé Next Gen — Academia</p>
        <p>suportepelenextgen@hotmail.com</p>
      </div>
    </footer>
  );
}
