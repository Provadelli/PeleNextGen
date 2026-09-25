import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme";
import { SessionProvider } from "@/lib/session";
import { NotFound } from "@/components/NotFound";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SmoothScroll } from "@/components/SmoothScroll";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pelé Next Gen — Peneiras de futebol" },
      {
        name: "description",
        content:
          "Plataforma oficial Pelé Next Gen: peneiras de futebol, avaliação por olheiros e perfis de atletas.",
      },
      { name: "author", content: "Pelé Next Gen" },
      { name: "google-site-verification", content: "8B7v2AZ4nAn4hYupG0ftbxG3kS5an6nL5yj6rCqhlgE" },
      { property: "og:site_name", content: "Pelé Next Gen" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },

      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Pelé Next Gen",
          url: "https://pelenextgen.vercel.app",
          logo: "https://pelenextgen.vercel.app/favicon.png",
          sameAs: [],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * "Pular para o conteúdo" (WCAG 2.4.1). Primeiro item da ordem de tabulação em todas as
 * páginas. O foco é movido via JS porque o Lenis (SmoothScroll) intercepta o salto por âncora
 * e porque nem toda rota tem `#conteudo` — nesse caso cai no primeiro <main>.
 */
function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="skip-link"
      onClick={(e) => {
        const alvo =
          document.getElementById("conteudo") ?? document.querySelector<HTMLElement>("main");
        if (!alvo) return;
        e.preventDefault();
        if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
        alvo.focus({ preventScroll: true });
        alvo.scrollIntoView({ block: "start" });
      }}
    >
      Pular para o conteúdo
    </a>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SkipLink />
        <SmoothScroll />
        <Outlet />
        <CookieConsentBanner />
      </SessionProvider>
    </ThemeProvider>
  );
}
