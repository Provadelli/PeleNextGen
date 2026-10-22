import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PRAZO_LIBERACAO, type Solicitacao } from "@/lib/solicitacoes";

/** Status de uma solicitação de desbloqueio para o clube (pendente, liberado ou recusado). */
export function SolicitacaoStatus({ solicitacao }: { solicitacao: Solicitacao }) {
  if (solicitacao.status === "pendente") {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
      >
        <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong>Solicitação pendente.</strong> Liberação {PRAZO_LIBERACAO}.
        </span>
      </p>
    );
  }
  if (solicitacao.status === "liberado") {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <strong>Contato liberado</strong>
      </p>
    );
  }
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm"
    >
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <span>
        <strong className="text-destructive">Solicitação recusada.</strong>
        {solicitacao.observacao ? ` ${solicitacao.observacao}` : ""} Você pode solicitar de novo.
      </span>
    </p>
  );
}
