import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type StatusSolicitacao = "pendente" | "liberado" | "recusado";

export const PRAZO_LIBERACAO = "até 24h úteis";

export interface Solicitacao {
  id: string;
  clube_id: string;
  candidato_id: string;
  status: StatusSolicitacao;
  criado_em: string;
  resolvido_em: string | null;
  observacao: string | null;
}

async function authFetch(path: string, body: unknown) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Você precisa estar autenticado.");
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

/** Clube pede o desbloqueio; a equipe é avisada no servidor. */
export async function solicitarDesbloqueio(candidatoId: string): Promise<StatusSolicitacao> {
  const res = await authFetch("/api/contatos/unlock", { candidatoId });
  if (!res.ok) {
    throw new Error(
      res.status === 403
        ? "Apenas contas de clube podem solicitar desbloqueio."
        : "Não foi possível enviar a solicitação. Tente novamente.",
    );
  }
  const json = (await res.json()) as { status?: StatusSolicitacao };
  // Se o contato já estava liberado, a sessão precisa recarregar a lista.
  if (typeof window !== "undefined") window.dispatchEvent(new Event("png-session"));
  return json.status ?? "pendente";
}

/** Suporte aprova ou recusa; a criação em contatos_desbloqueados é do servidor. */
export async function resolverSolicitacao(
  solicitacaoId: string,
  decisao: "liberado" | "recusado",
  observacao?: string,
) {
  const res = await authFetch("/api/contatos/resolver", { solicitacaoId, decisao, observacao });
  if (!res.ok) {
    throw new Error(
      res.status === 409
        ? "Esta solicitação já foi resolvida."
        : "Não foi possível resolver a solicitação.",
    );
  }
}

/** Solicitações do clube logado (RLS devolve só as dele). */
export function useMinhasSolicitacoes() {
  const { user } = useSession();
  const isClube = user?.role === "clube";
  const [rows, setRows] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    if (!user || !isClube) return;
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from("solicitacoes_desbloqueio")
      .select("id, clube_id, candidato_id, status, criado_em, resolvido_em, observacao")
      .eq("clube_id", user.id)
      .order("criado_em", { ascending: false });
    if (err) setError(true);
    else setRows((data ?? []) as Solicitacao[]);
    setLoading(false);
  }, [user, isClube]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Status mais recente entre os ids informados (candidato ou user_id do atleta). */
  const statusDe = useCallback(
    (...ids: (string | undefined)[]): Solicitacao | undefined =>
      rows.find((r) => ids.includes(r.candidato_id)),
    [rows],
  );

  return { rows, loading, error, reload, statusDe };
}
