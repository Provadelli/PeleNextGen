import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Inbox, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { resolverSolicitacao, type Solicitacao } from "@/lib/solicitacoes";

interface Linha extends Solicitacao {
  clubeNome: string;
  atletaNome: string;
}

type Filtro = "pendente" | "todas";

const ROTULO_STATUS = { pendente: "Pendente", liberado: "Liberado", recusado: "Recusado" } as const;

/** Fila de solicitações de desbloqueio: o suporte aprova (libera o contato) ou recusa. */
export function DesbloqueiosTab({ onPendentes }: { onPendentes?: (n: number) => void }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("pendente");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErro(false);
    const { data, error } = await supabase
      .from("solicitacoes_desbloqueio")
      .select("id, clube_id, candidato_id, status, criado_em, resolvido_em, observacao")
      .order("criado_em", { ascending: false });
    if (error) {
      setErro(true);
      setLoading(false);
      return;
    }
    const sols = (data ?? []) as Solicitacao[];
    const ids = Array.from(new Set(sols.flatMap((s) => [s.clube_id, s.candidato_id])));
    const [{ data: perfis }, { data: cands }] =
      ids.length > 0
        ? await Promise.all([
            supabase.from("profiles").select("id, nome, nome_clube").in("id", ids),
            supabase.from("candidatos").select("id, nome").in("id", ids),
          ])
        : [{ data: [] }, { data: [] }];
    const nomes = new Map<string, string>();
    (cands ?? []).forEach((c) => nomes.set(c.id, c.nome));
    (perfis ?? []).forEach((p) => nomes.set(p.id, p.nome_clube || p.nome));
    setLinhas(
      sols.map((s) => ({
        ...s,
        clubeNome: nomes.get(s.clube_id) ?? "Clube",
        atletaNome: nomes.get(s.candidato_id) ?? "Atleta",
      })),
    );
    onPendentes?.(sols.filter((s) => s.status === "pendente").length);
    setLoading(false);
  }, [onPendentes]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolver(l: Linha, decisao: "liberado" | "recusado") {
    if (busyId) return;
    setBusyId(l.id);
    try {
      await resolverSolicitacao(l.id, decisao, observacoes[l.id]);
      toast.success(
        decisao === "liberado"
          ? `Contato de ${l.atletaNome} liberado para ${l.clubeNome}.`
          : "Solicitação recusada.",
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao resolver a solicitação.");
    } finally {
      setBusyId(null);
    }
  }

  const visiveis = linhas.filter((l) => filtro === "todas" || l.status === "pendente");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
        <div role="group" aria-label="Filtrar solicitações" className="flex gap-1">
          {(
            [
              ["pendente", "Pendentes"],
              ["todas", "Todas"],
            ] as const
          ).map(([v, label]) => (
            <Button
              key={v}
              size="sm"
              variant={filtro === v ? "default" : "outline"}
              aria-pressed={filtro === v}
              onClick={() => setFiltro(v)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw
            className={"mr-1.5 h-3.5 w-3.5" + (loading ? " animate-spin" : "")}
            aria-hidden="true"
          />
          Atualizar
        </Button>
      </div>

      {loading && linhas.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="Carregando solicitações">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : erro ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-semibold text-destructive">
              Não foi possível carregar as solicitações.
            </p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : visiveis.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-card">
          <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg font-bold">
            {filtro === "pendente" ? "Nenhuma solicitação pendente" : "Nenhuma solicitação ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Quando um clube pedir o contato de um atleta, o pedido aparece aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visiveis.map((l) => (
            <li key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {l.clubeNome}{" "}
                    <span className="font-normal text-muted-foreground">pediu o contato de</span>{" "}
                    {l.atletaNome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(l.criado_em).toLocaleString("pt-BR")} · {ROTULO_STATUS[l.status]}
                    {l.observacao ? ` · ${l.observacao}` : ""}
                  </p>
                </div>
                {l.status !== "pendente" && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                    {ROTULO_STATUS[l.status]}
                  </span>
                )}
              </div>

              {l.status === "pendente" && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Observação (opcional, o clube vê em caso de recusa)
                    <Textarea
                      className="mt-1"
                      rows={2}
                      maxLength={500}
                      value={observacoes[l.id] ?? ""}
                      onChange={(e) => setObservacoes((o) => ({ ...o, [l.id]: e.target.value }))}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={!!busyId}
                      onClick={() => void resolver(l, "liberado")}
                    >
                      {busyId === l.id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Aprovar
                      <span className="sr-only"> pedido de {l.clubeNome}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!busyId}
                      onClick={() => void resolver(l, "recusado")}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Recusar
                      <span className="sr-only"> pedido de {l.clubeNome}</span>
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
