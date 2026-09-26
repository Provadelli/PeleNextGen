import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useVanilla } from "@/hooks/use-vanilla";
import { montarFeed } from "@/assets/js/feed.js";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed de atletas — Pelé Next Gen" },
      {
        name: "description",
        content:
          "Descubra atletas da base, confirme atributos, vote e siga talentos por posição e região.",
      },
    ],
  }),
  component: FeedPage,
});

interface AtletaFeed {
  id: string;
  nome: string;
  posicao: string | null;
  cidade: string | null;
  avatar_url: string | null;
}

/**
 * Feed de atletas. O React só busca os dados no Supabase e mostra o carregamento;
 * toda a área interativa (abas, filtros, cards, votos, tags, seguir e favoritar)
 * é criada em JavaScript nativo por src/assets/js/feed.js.
 */
function FeedPage() {
  useRequireAuth();
  const navigate = useNavigate();
  const [atletas, setAtletas] = useState<AtletaFeed[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.rpc("get_athlete_leaderboard", { _limit: 1000 }).then(({ data, error }) => {
      if (!ativo) return;
      if (error) {
        setErro(true);
        setAtletas([]);
        return;
      }
      setAtletas(
        (data ?? []).map((a) => ({
          id: a.id,
          nome: a.nome,
          posicao: a.posicao,
          cidade: a.cidade,
          avatar_url: a.avatar_url,
        })),
      );
    });
    return () => {
      ativo = false;
    };
  }, []);

  const feedRef = useVanilla<HTMLDivElement>(
    (elemento) => {
      if (!atletas) return;
      return montarFeed(elemento, atletas, {
        aoAbrirPerfil: (id: string) => navigate({ to: "/a/$atletaId", params: { atletaId: id } }),
      });
    },
    [atletas],
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Newspaper className="h-7 w-7 text-primary" aria-hidden="true" />
            Feed de atletas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Confirme os atributos que você viu em campo, vote nos destaques e siga os atletas que
            quer acompanhar. Filtre por posição e região sem sair da página.
          </p>
        </header>

        {atletas === null && (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Carregando atletas"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-bg2" />
            ))}
          </div>
        )}

        {erro && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
          >
            Não foi possível carregar os atletas agora. Atualize a página para tentar de novo.
          </p>
        )}

        {/* Área controlada pelo JavaScript nativo: o React não coloca filhos aqui. */}
        <div ref={feedRef} className="grid gap-4" />
      </div>
    </AppLayout>
  );
}
