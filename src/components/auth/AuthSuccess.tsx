import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Tela de confirmação após enviar um cadastro que depende de aprovação. */
export function AuthSuccess({
  title = "Cadastro enviado!",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <main
      id="conteudo"
      className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6"
    >
      <div role="status" className="w-full max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">{title}</h1>
        {children ?? (
          <>
            <p className="mt-3 text-muted-foreground">
              Seu cadastro foi recebido com sucesso. Aguarde o suporte para liberação de acesso.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Você receberá uma notificação quando seu acesso for ativado.
            </p>
          </>
        )}
        <nav
          aria-label="Próximos passos"
          className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"
        >
          <Button asChild>
            <Link to="/login">Voltar para login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Ir para o início</Link>
          </Button>
        </nav>
      </div>
    </main>
  );
}
