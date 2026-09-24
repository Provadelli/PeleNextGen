import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/home/Hero";
import { GoldButton } from "@/components/home/GoldButton";
import { MaisQueUmaPeneira } from "@/components/home/MaisQueUmaPeneira";
import { Historia } from "@/components/home/Historia";
import { DentroDaAcademia } from "@/components/home/DentroDaAcademia";
import { ComoFunciona } from "@/components/home/ComoFunciona";
import { PeneirasSection } from "@/components/home/PeneirasSection";
import { MapaOportunidades } from "@/components/home/MapaOportunidades";
import { Parceiros } from "@/components/home/Parceiros";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Footer } from "@/components/Footer";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { PageLoader } from "@/components/home/PageLoader";
import { fetchPeneirasFromDb } from "@/lib/peneiras.db";
import type { Peneira } from "@/lib/mock-data";
import { SECTIONS, SECTION_IDS, scrollToSection } from "@/lib/home-sections";
import { smoothScrollTo } from "@/components/SmoothScroll";

// TODO: trocar por uma imagem de compartilhamento própria (1200x630) quando disponível.
const HOME_OG_IMAGE = "https://pelenextgen.vercel.app/favicon.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pelé Next Gen — Peneiras oficiais e avaliação de atletas" },
      {
        name: "description",
        content:
          "O talento existe, falta a oportunidade. Encontre peneiras oficiais, seja avaliado por olheiros profissionais e acompanhe sua evolução.",
      },
      {
        property: "og:title",
        content: "Pelé Next Gen — Peneiras oficiais e avaliação de atletas",
      },
      {
        property: "og:description",
        content:
          "Encontre peneiras oficiais em todo o Brasil, seja avaliado por olheiros e dê o próximo passo na sua carreira no futebol.",
      },
      { property: "og:url", content: "https://pelenextgen.vercel.app/" },
      { property: "og:image", content: HOME_OG_IMAGE },
      { name: "twitter:image", content: HOME_OG_IMAGE },
      {
        name: "twitter:title",
        content: "Pelé Next Gen — Peneiras oficiais e avaliação de atletas",
      },
      {
        name: "twitter:description",
        content:
          "Encontre peneiras oficiais em todo o Brasil e seja avaliado por olheiros profissionais.",
      },
    ],
    links: [{ rel: "canonical", href: "https://pelenextgen.vercel.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pelé Next Gen",
          url: "https://pelenextgen.vercel.app",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [peneiras, setPeneiras] = useState<Peneira[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const active = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    fetchPeneirasFromDb()
      .then(setPeneiras)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Header some ao descer e volta ao subir (mais tela para o conteúdo).
    let last = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 480);
        last = y;
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const proxima = peneiras.find((p) => p.status === "aberta") ?? peneiras[0] ?? null;

  return (
    <div className="min-h-screen">
      <PageLoader />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "border-b border-border bg-background/80 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
          hidden && !menu && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link
            to="/"
            aria-label="Pelé Next Gen — voltar ao início"
            onClick={() => {
              setMenu(false);
              smoothScrollTo(0);
              window.history.replaceState(null, "", "/");
            }}
            className="shrink-0 transition-transform duration-300 hover:scale-[1.04] active:scale-95"
          >
            <Logo
              variant={scrolled ? "auto" : "onDark"}
              className="[&_img]:h-10 sm:[&_img]:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => scrollToSection(e, s.id)}
                data-active={active === s.id}
                className={cn(
                  "relative text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:text-primary active:scale-90 data-[active=true]:text-primary",
                  scrolled ? "text-foreground/65" : "text-white/80",
                )}
              >
                {s.label}
                <span
                  className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300"
                  style={{ transform: active === s.id ? "scaleX(1)" : undefined }}
                />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                "hidden h-10 items-center px-3 text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-primary sm:inline-flex",
                scrolled ? "text-foreground/80" : "text-white/90",
              )}
            >
              Entrar
            </Link>
            <GoldButton href="/cadastro" className="h-10 px-4 text-[10px] sm:px-5 sm:text-[11px]">
              Cadastrar
            </GoldButton>
            <button
              type="button"
              aria-label="Abrir menu de seções"
              onClick={() => setMenu((v) => !v)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 active:scale-90 lg:hidden",
                scrolled ? "border-border" : "border-white/30 text-white",
              )}
            >
              {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="grid gap-1 border-t border-border bg-background/95 px-4 pb-4 pt-3 backdrop-blur sm:px-6 lg:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  setMenu(false);
                  scrollToSection(e, s.id);
                }}
                className="rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-foreground/75 transition-all duration-300 hover:bg-bg2 hover:text-primary active:scale-95"
              >
                {s.label}
              </a>
            ))}
            {/* No celular o "Entrar" do topo fica escondido: acesso pelo menu. */}
            <Link
              to="/login"
              onClick={() => setMenu(false)}
              className="mt-2 rounded-lg border border-primary/40 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95 sm:hidden"
            >
              Entrar
            </Link>
          </nav>
        )}
      </header>

      <main>
        <Hero proxima={proxima} loading={loading} />
        <MaisQueUmaPeneira />
        <Historia />
        <DentroDaAcademia />
        <ComoFunciona />
        <PeneirasSection peneiras={peneiras} loading={loading} />
        <MapaOportunidades peneiras={peneiras} />
        <Parceiros />
        <CtaFinal />
      </main>

      <Footer />
    </div>
  );
}
