import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRECO_CONTATO_BRL } from "@/lib/mock-data";
import { unlockContato } from "@/lib/session";

export interface UnlockTarget {
  /** Id aceito por /api/contatos/unlock: candidatos.id ou o user_id do atleta. */
  id: string;
  nome: string;
}

const precoFormatado = `R$ ${PRECO_CONTATO_BRL.toFixed(2).replace(".", ",")}`;

/**
 * Checkout simulado para o clube liberar e-mail e celular de um atleta:
 * idle → processando (~1,2s) → aprovado (fecha sozinho em seguida).
 * Usado em /clubes (atletas aprovados) e /ranking (todos os atletas).
 */
export function UnlockContatoDialog({
  target,
  onClose,
}: {
  target: UnlockTarget | null;
  onClose: () => void;
}) {
  const [pagamento, setPagamento] = useState<"idle" | "processando" | "aprovado">("idle");

  useEffect(() => {
    if (target) setPagamento("idle");
  }, [target]);

  async function confirmarPagamento() {
    if (!target || pagamento !== "idle") return;
    setPagamento("processando");
    try {
      // Simulação: o "processamento" leva ~1,2s e o servidor sempre aprova.
      await Promise.all([unlockContato(target.id), new Promise((r) => setTimeout(r, 1200))]);
      setPagamento("aprovado");
      toast.success("Pagamento aprovado!", {
        description: `Contato de ${target.nome} desbloqueado.`,
      });
      setTimeout(onClose, 1500);
    } catch (err) {
      setPagamento("idle");
      toast.error(err instanceof Error ? err.message : "Erro ao desbloquear contato");
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && pagamento !== "processando" && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar contato do atleta</DialogTitle>
          <DialogDescription>
            Você está liberando os dados de contato (e-mail e celular) de{" "}
            <strong className="text-foreground">{target?.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor</p>
          <p className="font-display text-3xl font-extrabold text-gradient-gold">{precoFormatado}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pagamento único por atleta. Acesso permanente após confirmação. Após liberar, você
            também poderá enviar mensagens diretamente para o atleta.
          </p>
        </div>

        {pagamento === "aprovado" ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-4"
          >
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
            <div>
              <p className="font-semibold text-success">Pagamento aprovado</p>
              <p className="text-xs text-muted-foreground">
                E-mail e celular de {target?.nome} já estão liberados.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            * Pagamento simulado (projeto acadêmico). Nenhuma cobrança real será efetuada.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pagamento === "processando"}>
            {pagamento === "aprovado" ? "Fechar" : "Cancelar"}
          </Button>
          {pagamento !== "aprovado" && (
            <Button onClick={confirmarPagamento} disabled={pagamento === "processando"}>
              {pagamento === "processando" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {pagamento === "processando" ? "Processando pagamento…" : "Confirmar pagamento"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
