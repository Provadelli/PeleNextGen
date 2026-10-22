import { useId, type ReactNode } from "react";
import { CalendarX2, CheckCircle2, Loader2, Plus, SearchX, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { EmptyState } from "@/components/EmptyState";
import { PeneiraCard } from "@/components/PeneiraCard";
import { SolicitacaoStatus } from "@/components/SolicitacaoStatus";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { peneiras, type Peneira } from "@/lib/mock-data";
import type { Solicitacao } from "@/lib/solicitacoes";
import { cn } from "@/lib/utils";

/* Estados forçados: as mesmas utilidades que :focus-visible e :active aplicam nos componentes. */
const FOCO = "ring-2 ring-ring ring-offset-2 ring-offset-background scale-[1.02] shadow-gold";
const ATIVO = "scale-[0.98]";
const FOCO_CAMPO = "ring-1 ring-ring";

const HOVER_BOTAO = {
  default: "bg-primary/90",
  destructive: "bg-destructive/90",
  error: "bg-error/90",
  outline: "bg-accent text-accent-foreground",
  secondary: "bg-secondary/80",
  ghost: "bg-accent text-accent-foreground",
  link: "underline",
} as const;

const VARIANTES = Object.keys(HOVER_BOTAO) as (keyof typeof HOVER_BOTAO)[];

export function ComponentsSection() {
  return (
    <div className="space-y-10">
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Legenda.</strong> Todos os itens usam os componentes
        reais de <code>src/components</code>. Os estados <em>default</em>, <em>disabled</em>,
        erro, sucesso e <em>loading</em> são reais. Para <em>hover</em>, <em>focus-visible</em> e{" "}
        <em>active</em>, que dependem do mouse e do teclado, o estado é{" "}
        <strong className="text-foreground">forçado com as classes utilitárias equivalentes</strong>{" "}
        passadas por <code>className</code> (marcados com “forçado”). Para ver o real, passe o
        mouse ou use <kbd>Tab</kbd> em qualquer exemplo.
      </p>

      <Bloco id="botao" titulo="Button" nota="7 variantes × estados; 4 tamanhos.">
        <div className="space-y-6">
          {VARIANTES.map((v) => (
            <Linha key={v} rotulo={`variant="${v}"`}>
              <Estado nome="default">
                <Button variant={v}>Inscrever-se</Button>
              </Estado>
              <Estado nome="hover (forçado)">
                <Button variant={v} className={HOVER_BOTAO[v]}>
                  Inscrever-se
                </Button>
              </Estado>
              <Estado nome="focus-visible (forçado)">
                <Button variant={v} className={FOCO}>
                  Inscrever-se
                </Button>
              </Estado>
              <Estado nome="active (forçado)">
                <Button variant={v} className={ATIVO}>
                  Inscrever-se
                </Button>
              </Estado>
              <Estado nome="disabled">
                <Button variant={v} disabled>
                  Inscrever-se
                </Button>
              </Estado>
              <Estado nome="loading">
                <Button variant={v} disabled aria-busy="true">
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Enviando…
                </Button>
              </Estado>
            </Linha>
          ))}
          <Linha rotulo="size">
            <Estado nome="sm">
              <Button size="sm">Pequeno</Button>
            </Estado>
            <Estado nome="default">
              <Button>Padrão</Button>
            </Estado>
            <Estado nome="lg">
              <Button size="lg">Grande</Button>
            </Estado>
            <Estado nome="icon">
              <Button size="icon" aria-label="Adicionar">
                <Plus aria-hidden="true" />
              </Button>
            </Estado>
            <Estado nome="ThemeToggle (h-11 w-11)">
              <ThemeToggle />
            </Estado>
          </Linha>
        </div>
      </Bloco>

      <Bloco
        id="campos"
        titulo="Input, Textarea e Select"
        nota="Label sempre associado; erro com aria-invalid e aria-describedby. O Input não tem estilo de hover próprio."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <CamposGrupo titulo="Input" tipo="input" />
          <CamposGrupo titulo="Textarea" tipo="textarea" />
          <CamposGrupo titulo="Select" tipo="select" />
        </div>
      </Bloco>

      <Bloco id="badges" titulo="Badge e StatusBadge" nota="Badge (shadcn) e StatusBadge (status da peneira).">
        <div className="space-y-4">
          <Linha rotulo="Badge — variant">
            <Estado nome="default">
              <Badge>Novo</Badge>
            </Estado>
            <Estado nome="secondary">
              <Badge variant="secondary">Sub-17</Badge>
            </Estado>
            <Estado nome="destructive">
              <Badge variant="destructive">Reprovado</Badge>
            </Estado>
            <Estado nome="outline">
              <Badge variant="outline">Rascunho</Badge>
            </Estado>
            <Estado nome="focus (forçado)">
              <Badge className="ring-2 ring-ring ring-offset-2 ring-offset-background">Novo</Badge>
            </Estado>
          </Linha>
          <Linha rotulo="StatusBadge — status">
            <Estado nome="aberta">
              <StatusBadge status="aberta" />
            </Estado>
            <Estado nome="em_andamento">
              <StatusBadge status="em_andamento" />
            </Estado>
            <Estado nome="encerrada">
              <StatusBadge status="encerrada" />
            </Estado>
          </Linha>
        </div>
      </Bloco>

      <Bloco id="card" titulo="Card" nota="Default, hover forçado e carregando (Skeleton).">
        <div className="grid gap-4 md:grid-cols-3">
          <Estado nome="default">
            <Card>
              <CardHeader>
                <CardTitle>Peneira Sub-17</CardTitle>
                <CardDescription>Santos/SP · 18 mai 2026</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">64 inscritos de 132 vagas.</CardContent>
            </Card>
          </Estado>
          <Estado nome="hover (forçado)">
            <Card className="-translate-y-1 border-primary/40 shadow-gold">
              <CardHeader>
                <CardTitle>Peneira Sub-17</CardTitle>
                <CardDescription>Santos/SP · 18 mai 2026</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">64 inscritos de 132 vagas.</CardContent>
            </Card>
          </Estado>
          <Estado nome="loading">
            <Card aria-busy="true">
              <CardHeader>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          </Estado>
        </div>
      </Bloco>

      <Bloco id="alert" titulo="Alert" nota="O componente tem as variantes default e destructive; sucesso usa as classes do token --success.">
        <div className="grid gap-4 md:grid-cols-3">
          <Estado nome="default (informação)">
            <Alert>
              <AlertTitle>Inscrições abertas</AlertTitle>
              <AlertDescription>Você pode se inscrever até 15 de maio.</AlertDescription>
            </Alert>
          </Estado>
          <Estado nome="destructive (erro)">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Não foi possível salvar</AlertTitle>
              <AlertDescription>Verifique sua conexão e tente novamente.</AlertDescription>
            </Alert>
          </Estado>
          <Estado nome="sucesso (token --success)">
            <Alert className="border-success/50 text-success">
              <CheckCircle2 className="h-4 w-4 !text-success" aria-hidden="true" />
              <AlertTitle>Inscrição confirmada</AlertTitle>
              <AlertDescription>Enviamos os detalhes por e-mail.</AlertDescription>
            </Alert>
          </Estado>
        </div>
      </Bloco>

      <Bloco id="dialog" titulo="Dialog" nota="Abre de verdade: foco preso no diálogo, Esc fecha e devolve o foco ao botão.">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar inscrição</DialogTitle>
              <DialogDescription>
                Você será inscrito na Peneira Sub-17 em Santos/SP. Deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost">Cancelar</Button>
              <Button>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Bloco>

      <Bloco id="tabs" titulo="Tabs" nota="Navegação por setas; aba desabilitada e foco forçado.">
        <div className="grid gap-4 md:grid-cols-2">
          <Estado nome="default · ativa · disabled">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Resumo</TabsTrigger>
                <TabsTrigger value="b">Jogos</TabsTrigger>
                <TabsTrigger value="c" disabled>
                  Resultados
                </TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="text-sm">
                Conteúdo do resumo.
              </TabsContent>
              <TabsContent value="b" className="text-sm">
                Conteúdo dos jogos.
              </TabsContent>
            </Tabs>
          </Estado>
          <Estado nome="focus-visible (forçado)">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a" className="ring-2 ring-ring ring-offset-2 ring-offset-background">
                  Resumo
                </TabsTrigger>
                <TabsTrigger value="b">Jogos</TabsTrigger>
              </TabsList>
            </Tabs>
          </Estado>
        </div>
      </Bloco>

      <Bloco id="table" titulo="Table" nota="Com dados, carregando e vazia. Em telas estreitas a tabela rola dentro do próprio container.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Estado nome="com dados (hover na linha)">
            <TabelaExemplo />
          </Estado>
          <Estado nome="loading">
            <Table aria-busy="true">
              <TableCaption className="sr-only">Carregando atletas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Estado>
          <Estado nome="vazio">
            <Table>
              <TableCaption className="sr-only">Atletas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                    Nenhum atleta avaliado ainda.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Estado>
        </div>
      </Bloco>

      <Bloco id="skeleton" titulo="Skeleton e EmptyState" nota="Carregando e vazio.">
        <div className="grid gap-4 md:grid-cols-2">
          <Estado nome="Skeleton (loading)">
            <div className="space-y-3 rounded-xl border border-border bg-card p-4" aria-busy="true">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </Estado>
          <Estado nome="EmptyState (vazio)">
            <EmptyState
              icon={CalendarX2}
              title="Nenhuma peneira agendada"
              description="Quando houver peneiras abertas ou em breve, elas aparecem aqui."
              action={
                <Button size="sm" variant="outline">
                  Criar peneira
                </Button>
              }
            />
          </Estado>
          <Estado nome="EmptyState (busca sem resultado)">
            <EmptyState
              icon={SearchX}
              title="Nada encontrado"
              description="Tente outro termo ou limpe os filtros."
            />
          </Estado>
        </div>
      </Bloco>

      <Bloco id="peneira-card" titulo="PeneiraCard" nota="Dados reais de mock-data: aberta, em andamento, encerrada, lotada e privada.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exemplosPeneira().map(({ nome, peneira }) => (
            <Estado key={nome} nome={nome}>
              <PeneiraCard peneira={peneira} />
            </Estado>
          ))}
        </div>
      </Bloco>

      <Bloco id="solicitacao" titulo="SolicitacaoStatus" nota="Pendente, liberado e recusado (com e sem observação).">
        <div className="grid gap-4 md:grid-cols-2">
          {SOLICITACOES.map((s) => (
            <Estado key={s.nome} nome={s.nome}>
              <SolicitacaoStatus solicitacao={s.dados} />
            </Estado>
          ))}
        </div>
      </Bloco>

      <Bloco id="avatar" titulo="AthleteAvatar" nota="Com foto, sem foto (rótulo acessível) e decorativo (alt vazio).">
        <Linha rotulo="tamanhos e variações">
          <Estado nome="com foto">
            <AthleteAvatar src="/favicon.png" alt="Foto do atleta" className="h-14 w-14 bg-bg2" />
          </Estado>
          <Estado nome="sem foto">
            <AthleteAvatar alt="Atleta sem foto" className="h-14 w-14" />
          </Estado>
          <Estado nome="decorativo (alt=&quot;&quot;)">
            <AthleteAvatar alt="" className="h-14 w-14" />
          </Estado>
          <Estado nome="pequeno">
            <AthleteAvatar alt="Atleta" className="h-8 w-8" />
          </Estado>
          <Estado nome="grande">
            <AthleteAvatar alt="Atleta" className="h-20 w-20" />
          </Estado>
        </Linha>
      </Bloco>
    </div>
  );
}

const SOLICITACOES: { nome: string; dados: Solicitacao }[] = [
  {
    nome: "pendente",
    dados: base("pendente", null),
  },
  { nome: "liberado", dados: base("liberado", null) },
  { nome: "recusado (com observação)", dados: base("recusado", "Dados do clube incompletos.") },
  { nome: "recusado (sem observação)", dados: base("recusado", null) },
];

function base(status: Solicitacao["status"], observacao: string | null): Solicitacao {
  return {
    id: "demo",
    clube_id: "demo-clube",
    candidato_id: "demo-candidato",
    status,
    criado_em: "2026-10-01T12:00:00Z",
    resolvido_em: status === "pendente" ? null : "2026-10-02T12:00:00Z",
    observacao,
  };
}

function exemplosPeneira(): { nome: string; peneira: Peneira }[] {
  const por = (s: Peneira["status"]) => peneiras.find((p) => p.status === s) ?? peneiras[0];
  const aberta = por("aberta");
  return [
    { nome: "aberta", peneira: aberta },
    { nome: "em andamento", peneira: por("em_andamento") },
    { nome: "encerrada", peneira: por("encerrada") },
    { nome: "lotada", peneira: { ...aberta, id: "demo-lotada", inscritos: aberta.vagas } },
    {
      nome: "privada",
      peneira: peneiras.find((p) => p.visibilidade === "privada") ?? {
        ...aberta,
        id: "demo-privada",
        visibilidade: "privada",
      },
    },
  ];
}

function TabelaExemplo() {
  return (
    <Table>
      <TableCaption className="sr-only">Atletas avaliados</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Atleta</TableHead>
          <TableHead>Nota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Atleta A</TableCell>
          <TableCell>8,4</TableCell>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell>Atleta B (hover forçado)</TableCell>
          <TableCell>7,9</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Atleta C</TableCell>
          <TableCell>7,2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

/** Campo com label, ajuda e mensagem, nos estados reais e forçados. */
function CamposGrupo({ titulo, tipo }: { titulo: string; tipo: "input" | "textarea" | "select" }) {
  const uid = useId();
  const estados: {
    nome: string;
    cls?: string;
    disabled?: boolean;
    erro?: boolean;
    sucesso?: boolean;
    valor?: string;
  }[] = [
    { nome: "default" },
    { nome: "focus-visible (forçado)", cls: FOCO_CAMPO },
    { nome: "preenchido", valor: tipo === "select" ? "atacante" : "Arthur Moreira" },
    { nome: "disabled", disabled: true },
    { nome: "erro", erro: true, valor: tipo === "select" ? undefined : "texto inválido" },
    { nome: "sucesso", sucesso: true, valor: tipo === "select" ? "atacante" : "arthur@exemplo.com" },
  ];

  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 md:last:col-span-2">
      <h3 className="font-display text-lg font-bold">{titulo}</h3>
      <div className={cn("grid gap-4", tipo === "select" ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {estados.map((e, i) => {
          const id = `${uid}-${tipo}-${i}`;
          const erroId = `${id}-msg`;
          const aria = e.erro
            ? { "aria-invalid": true as const, "aria-describedby": erroId }
            : e.sucesso
              ? { "aria-describedby": erroId }
              : {};
          const cls = cn(e.cls, e.sucesso && "border-success focus-visible:ring-success");
          return (
            <div key={e.nome} className="min-w-0 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {e.nome}
              </p>
              <Label htmlFor={id}>{tipo === "select" ? "Posição" : tipo === "textarea" ? "Sobre você" : "E-mail"}</Label>
              {tipo === "input" && (
                <Input
                  id={id}
                  type="email"
                  placeholder="voce@exemplo.com"
                  defaultValue={e.valor}
                  disabled={e.disabled}
                  className={cls}
                  {...aria}
                />
              )}
              {tipo === "textarea" && (
                <Textarea
                  id={id}
                  placeholder="Conte sua trajetória"
                  defaultValue={e.valor}
                  disabled={e.disabled}
                  className={cls}
                  {...aria}
                />
              )}
              {tipo === "select" && (
                <Select defaultValue={e.valor} disabled={e.disabled}>
                  <SelectTrigger
                    id={id}
                    className={cn(cls, e.erro && "border-destructive ring-1 ring-destructive")}
                    {...aria}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goleiro">Goleiro</SelectItem>
                    <SelectItem value="zagueiro">Zagueiro</SelectItem>
                    <SelectItem value="atacante">Atacante</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {e.erro && (
                <p id={erroId} className="flex items-center gap-1 text-xs text-destructive">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {tipo === "select" ? "Escolha uma posição." : "Confira o valor informado."}
                </p>
              )}
              {e.sucesso && (
                <p id={erroId} className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Tudo certo.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bloco({
  id,
  titulo,
  nota,
  children,
}: {
  id: string;
  titulo: string;
  nota: string;
  children: ReactNode;
}) {
  return (
    <div id={`cmp-${id}`} className="scroll-mt-16 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{nota}</p>
      </div>
      <div className="min-w-0 rounded-2xl border border-border bg-bg2/40 p-4 sm:p-6">{children}</div>
    </div>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">
        <code>{rotulo}</code>
      </p>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-4">{children}</div>
    </div>
  );
}

function Estado({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{nome}</p>
      {children}
    </div>
  );
}
