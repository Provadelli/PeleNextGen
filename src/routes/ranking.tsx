import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, ShieldCheck, Filter, Lock, Mail, Phone } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { supabase } from "@/integrations/supabase/client";
import { BR_STATES } from "@/lib/br-states";
import { useSession } from "@/lib/session";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PRECO_CONTATO_BRL } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { UnlockContatoDialog, type UnlockTarget } from "@/components/UnlockContatoDialog";

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];
const SKILLS = [
  { key: "", label: "Média geral" },
  { key: "marcacao", label: "Marcação" },
  { key: "forca", label: "Força" },
  { key: "passe", label: "Passe" },
  { key: "velocidade", label: "Velocidade" },
  { key: "posicionamento", label: "Posicionamento" },
];

interface Row {
  rank: number;
  id: string;
  nome: string;
  avatar_url: string | null;
  posicao: string | null;
  cidade: string | null;
  score: number | null;
  is_validated: boolean;
  /** De onde veio o score: "habilidades", "avaliacao" ou null (sem dados). */
  fonte: string | null;
}

/** Limite alto o bastante para listar todos os atletas da plataforma. */
const RANKING_LIMIT = 1000;

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking de atletas — Pelé Next Gen" },
      { name: "description", content: "Leaderboard de atletas por posição, cidade e habilidade." },
      { property: "og:title", content: "Ranking de atletas — Pelé Next Gen" },
      { property: "og:url", content: "https://pelenextgen.vercel.app/ranking" },
    ],
    links: [{ rel: "canonical", href: "https://pelenextgen.vercel.app/ranking" }],
  }),
  component: RankingPage,
});

function RankingPage() {
  useRequireAuth();
  const [posicao, setPosicao] = useState("");
  const [cidade, setCidade] = useState("");
  const [skill, setSkill] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSession();
  const isClube = user?.role === "clube";
  const [contatos, setContatos] = useState<Map<string, { email: string; celular: string }>>(
    new Map(),
  );
  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget | null>(null);

  // Clube: o RLS de profiles só devolve e-mail/celular dos atletas já desbloqueados,
  // então a consulta abaixo já responde "quais contatos este clube liberou".
  useEffect(() => {
    if (!isClube || rows.length === 0) {
      setContatos(new Map());
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, email, celular")
      .in(
        "id",
        rows.map((r) => r.id),
      )
      .then(({ data }) => {
        if (cancelled) return;
        setContatos(
          new Map((data ?? []).map((p) => [p.id, { email: p.email ?? "", celular: p.celular ?? "" }])),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [isClube, rows, user?.contatosDesbloqueados?.length]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_athlete_leaderboard", {
        _posicao: posicao || undefined,
        _cidade: cidade || undefined,
        _skill: skill || undefined,
        _limit: RANKING_LIMIT,
      });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [posicao, cidade, skill]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Trophy className="h-7 w-7 text-primary" />
            Ranking de atletas
          </h1>
          <p className="text-sm text-muted-foreground">
            Todos os atletas da plataforma, classificados pelas habilidades ou pela nota da última
            avaliação — filtre por posição, cidade e skill específica.
            {isClube &&
              ` Para ver e-mail e celular de um atleta, libere o contato por R$ ${PRECO_CONTATO_BRL.toFixed(2).replace(".", ",")}.`}
          </p>
        </header>

        <div className="grid gap-3 rounded-2xl border border-border bg-bg2 p-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 flex items-center gap-1"><Filter className="h-3 w-3" /> Posição</span>
            <select
              value={posicao}
              onChange={(e) => setPosicao(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Todas</option>
              {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 block">Cidade / UF</span>
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: São Paulo ou SP"
              list="uf-list"
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            />
            <datalist id="uf-list">
              {BR_STATES.map((s) => <option key={s.uf} value={s.uf}>{s.nome}</option>)}
            </datalist>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            <span className="mb-1 block">Habilidade</span>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg3 px-3 py-2 text-sm text-foreground"
            >
              {SKILLS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-bg2">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Carregando ranking…</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nenhum atleta encontrado com esses filtros.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="reveal-on-scroll flex items-center gap-2.5 px-3 py-3 transition-colors hover:bg-bg3/40 sm:gap-4 sm:px-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${
                    r.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                    r.rank === 2 ? "bg-slate-400/20 text-slate-300" :
                    r.rank === 3 ? "bg-amber-700/20 text-amber-500" :
                    "bg-bg3 text-muted-foreground"
                  }`}>
                    {r.rank}
                  </span>
                  <AthleteAvatar src={r.avatar_url ?? undefined} alt={r.nome} className="h-9 w-9 shrink-0 border border-border sm:h-11 sm:w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to="/a/$atletaId" params={{ atletaId: r.id }} className="truncate text-sm font-semibold hover:text-primary">
                        {r.nome}
                      </Link>
                      {r.is_validated && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-label="Validado" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.posicao ?? "—"} {r.cidade ? `• ${r.cidade}` : ""}
                    </p>
                    {isClube && contatos.has(r.id) && (
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3 text-primary" />
                          {contatos.get(r.id)?.email || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-primary" />
                          {contatos.get(r.id)?.celular || "—"}
                        </span>
                      </p>
                    )}
                  </div>
                  {isClube && !contatos.has(r.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => setUnlockTarget({ id: r.id, nome: r.nome })}
                    >
                      <Lock className="mr-1.5 h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Liberar contato</span>
                      <span className="sm:hidden">Liberar</span>
                    </Button>
                  )}
                  <div className="w-11 shrink-0 text-right sm:w-16">
                    <p className="text-base font-bold text-primary sm:text-lg">{r.score ?? "—"}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {r.fonte === "avaliacao" ? "avaliação" : r.fonte ? "pontos" : "sem nota"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <UnlockContatoDialog target={unlockTarget} onClose={() => setUnlockTarget(null)} />
    </AppLayout>
  );
}
