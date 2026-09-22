import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Logo } from "@/components/Logo";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <Link to="/" className="mb-10">
        <Logo />
      </Link>
      <main>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Erro 404</p>
        <h1 className="mt-2 text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          A página que você procura não existe, foi movida ou o endereço está incorreto.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}
