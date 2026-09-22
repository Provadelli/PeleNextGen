import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrivacyNotice({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Sobre seus dados</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            A Pelé Next Gen conecta atletas, olheiros e clubes através de peneiras de futebol.
            Coletamos nome, contato, dados esportivos e, quando aplicável, documentos, para
            organizar peneiras, avaliar seu desempenho e viabilizar o contato entre as partes,
            conforme a Lei Geral de Proteção de Dados (LGPD).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/termos" target="_blank" rel="noopener noreferrer">
                Ver Termos de Uso
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
                Ver Política de Privacidade
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
