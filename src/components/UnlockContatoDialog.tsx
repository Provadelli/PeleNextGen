import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRAZO_LIBERACAO, solicitarDesbloqueio } from "@/lib/solicitacoes";

export interface UnlockTarget {
  /** Id aceito por /api/contatos/unlock: candidatos.id ou o user_id do atleta. */
  id: string;
  nome: string;
}

type Etapa = "idle" | "enviando" | "enviado" | "erro";

/**
 * Solicitação de desbloqueio (concierge): o clube pede, a equipe Pelé Next Gen libera.
 * idle → enviando → enviado (confirmação) | erro (com nova tentativa).
 * Usado em /candidatos, /clubes e /ranking.
 */
export function UnlockContatoDialog({
  target,
  onClose,
  onSolicitado,
}: {
  target: UnlockTarget | null;
  onClose: () => void;
  onSolicitado?: () => void;
}) {
  const [etapa, setEtapa] = useState<Etapa>("idle");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    if (target) setEtapa("idle");
  }, [target]);

  async function enviar() {
    if (!target || etapa === "enviando") return;
    setEtapa("enviando");
    try {
      await solicitarDesbloqueio(target.id);
      setEtapa("enviado");
      onSolicitado?.();
    } catch (err) {
      setMensagemErro(err instanceof Error ? err.message : "Erro ao enviar a solicitação.");
      setEtapa("erro");
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && etapa !== "enviando" && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar desbloqueio de contato</DialogTitle>
          <DialogDescription>
            Você está pedindo o e-mail e o celular de{" "}
            <strong className="text-foreground">{target?.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        {etapa === "enviado" ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-semibold text-success">Solicitação enviada</p>
              <p className="text-sm text-muted-foreground">
                Nossa equipe vai analisar o pedido e liberar o contato {PRAZO_LIBERACAO}. Você
                acompanha o status (pendente, liberado ou recusado) no card do atleta e recebe uma
                notificação quando houver resposta.
              </p>
            </div>
          </div>
        ) : (
          <div className="my-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              Liberação {PRAZO_LIBERACAO}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              A Pelé Next Gen opera este serviço de forma assistida: a equipe confirma o pedido e
              libera o contato manualmente. Os valores e a forma de pagamento são combinados
              diretamente com a equipe; nenhuma cobrança é feita pela plataforma.
            </p>
          </div>
        )}

        {etapa === "erro" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>{mensagemErro}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={etapa === "enviando"}>
            {etapa === "enviado" ? "Fechar" : "Cancelar"}
          </Button>
          {etapa !== "enviado" && (
            <Button onClick={enviar} disabled={etapa === "enviando"}>
              {etapa === "enviando" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {etapa === "enviando"
                ? "Enviando…"
                : etapa === "erro"
                  ? "Tentar novamente"
                  : "Solicitar desbloqueio"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
