import { Clock } from "lucide-react";

/** Aviso de que o cadastro (clube/admin) depende de aprovação do suporte. */
export function ApprovalNotice() {
  return (
    <aside
      aria-label="Aprovação necessária"
      className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5"
    >
      <div
        aria-hidden="true"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Clock className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-bold text-primary">Aprovação necessária</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          O cadastro não concede acesso imediato. Após o envio, o suporte validará seus dados e
          liberará o acesso.
        </p>
      </div>
    </aside>
  );
}
