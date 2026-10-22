import { AlertTriangle, CalendarX2, CheckCircle2, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PeneiraCard } from "@/components/PeneiraCard";
import { peneiras } from "@/lib/mock-data";

export function PatternsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Painel
        titulo="Cabeçalho de página"
        nota="Eyebrow dourado (text-gold-ink), h1 em font-display e texto de apoio em muted-foreground."
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-ink">Peneiras</p>
          <p className="font-display text-3xl font-bold">Encontre sua próxima chance</p>
          <p className="text-muted-foreground">Filtre por categoria, cidade e data.</p>
        </div>
      </Painel>

      <Painel
        titulo="Formulário"
        nota="Label acima do campo, gap-4 entre campos, ação principal no fim com 44px de altura no celular."
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="ds-nome">Nome completo</Label>
            <Input id="ds-nome" autoComplete="name" placeholder="Seu nome" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-email">E-mail</Label>
            <Input id="ds-email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
          </div>
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            Criar conta
          </Button>
        </form>
      </Painel>

      <Painel
        titulo="Grade de cards responsiva"
        nota="1 coluna no celular, 2 a partir de sm. Mesmo componente (PeneiraCard) em todas as telas."
        className="lg:col-span-2"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {peneiras.slice(0, 3).map((p) => (
            <PeneiraCard key={p.id} peneira={p} />
          ))}
        </div>
      </Painel>
    </div>
  );
}

export function StatesSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Painel
        titulo="Carregando"
        nota="Skeleton com aria-busy; o layout final é reservado para não pular."
      >
        <div className="space-y-3" aria-busy="true" role="status" aria-label="Carregando peneiras">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Painel>
      <Painel titulo="Vazio" nota="EmptyState: ícone, título, descrição e uma ação.">
        <EmptyState
          icon={CalendarX2}
          title="Nenhuma peneira encontrada"
          description="Ajuste os filtros ou volte mais tarde."
          action={
            <Button size="sm" variant="outline">
              Limpar filtros
            </Button>
          }
        />
      </Painel>
      <Painel titulo="Erro" nota="Alert destructive com role=alert e ação de tentar de novo.">
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Não foi possível carregar</AlertTitle>
            <AlertDescription>Verifique sua conexão e tente novamente.</AlertDescription>
          </Alert>
          <Button variant="outline" size="sm">
            <RotateCcw aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      </Painel>
      <Painel
        titulo="Sucesso"
        nota="Mensagem com ícone e cor do token --success; anunciada por role=status."
      >
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <strong>Inscrição confirmada</strong>
        </p>
      </Painel>
    </div>
  );
}

function Painel({
  titulo,
  nota,
  className,
  children,
}: {
  titulo: string;
  nota: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-w-0 space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6 ${className ?? ""}`}
    >
      <div>
        <h3 className="font-display text-lg font-bold">{titulo}</h3>
        <p className="text-xs text-muted-foreground">{nota}</p>
      </div>
      {children}
    </div>
  );
}
