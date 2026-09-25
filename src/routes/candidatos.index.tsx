import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquarePlus,
  Phone,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { candidatos as mockCandidatos, type Candidato } from "@/lib/mock-data";
import { calcularIdade } from "@/lib/date";
import { useSession } from "@/lib/session";
import { startConversation } from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/candidatos/")({
  head: () => ({
    meta: [
      { title: "Candidatos — Pelé Next Gen" },
      { name: "description", content: "Lista de candidatos inscritos nas peneiras." },
    ],
  }),
  component: CandidatosPage,
});

const STATUS_TABS = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "avaliado", label: "Avaliados" },
  { value: "aprovado", label: "Aprovados" },
] as const;

const PRECO_DESBLOQUEIO = 49.99;

function CandidatosPage() {
  const { user, ready } = useSession();
  const isClube = user?.role === "clube";
  const isAdmin = user?.role === "admin";
  const canScout = isAdmin || isClube;
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]["value"]>("todos");
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [realAtletas, setRealAtletas] = useState<Candidato[]>([]);
  // Estados da carga: "idle" (perfil sem acesso aos dados), "loading", "error", "ok".
  const [carga, setCarga] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const [tentativa, setTentativa] = useState(0);
  const effectiveStatus = status;

  useEffect(() => {
    if (!canScout) return;
    let cancelled = false;
    setCarga("loading");
    (async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "atleta");
      if (rolesError) throw rolesError;
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) {
        if (!cancelled) {
          setRealAtletas([]);
          setCarga("ok");
        }
        return;
      }
      const [{ data: profs, error: profsError }, { data: notas }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, nome, email, celular, avatar_url, data_nascimento, posicao, cidade, altura, peso, pe",
          )
          .in("id", ids),
        supabase
          .from("avaliacoes")
          .select("atleta_user_id, nota_geral, created_at")
          .in("atleta_user_id", ids)
          .order("created_at", { ascending: false }),
      ]);
      if (profsError) throw profsError;
      if (cancelled || !profs) return;
      const latestByAtleta = new Map<string, number>();
      (notas ?? []).forEach((n) => {
        if (n.atleta_user_id && n.nota_geral != null && !latestByAtleta.has(n.atleta_user_id)) {
          latestByAtleta.set(n.atleta_user_id, Number(n.nota_geral));
        }
      });
      const mapped: Candidato[] = profs.map((p) => ({
        id: `u_${p.id}`,
        userId: p.id,
        nome: p.nome ?? "Atleta",
        dataNascimento: p.data_nascimento ?? "2000-01-01",
        posicao: (p.posicao ?? "Meia") as Candidato["posicao"],
        cidade: p.cidade ?? "—",
        altura: p.altura ?? 0,
        peso: p.peso ?? 0,
        pe: (p.pe ?? "Destro") as Candidato["pe"],
        avatar: p.avatar_url ?? "",
        email: p.email ?? "",
        celular: p.celular ?? "",
        peneiraId: "",
        status: latestByAtleta.has(p.id) ? "avaliado" : "pendente",
        notaGeral: latestByAtleta.get(p.id),
      }));
      setRealAtletas(mapped);
      setCarga("ok");
    })().catch(() => {
      if (!cancelled) setCarga("error");
    });
    return () => {
      cancelled = true;
    };
  }, [canScout, tentativa]);

  const temFiltro = q.trim() !== "" || status !== "todos";
  function limparFiltros() {
    setQ("");
    setStatus("todos");
  }

  async function handleStartChat(c: Candidato) {
    if (!c.userId) return;
    setStartingChat(c.id);
    try {
      await startConversation(c.userId);
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao iniciar conversa");
    } finally {
      setStartingChat(null);
    }
  }

  const list = useMemo(() => {
    return realAtletas.filter((c) => {
      if (effectiveStatus !== "todos" && c.status !== effectiveStatus) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return (
        c.nome.toLowerCase().includes(t) ||
        c.posicao.toLowerCase().includes(t) ||
        c.cidade.toLowerCase().includes(t)
      );
    });
  }, [q, effectiveStatus, realAtletas]);

  if (ready && isClube) {
    return <Navigate to="/clubes" />;
  }

  return (
    <AppLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-ink">Candidatos</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          {isClube ? "Atletas aprovados" : "Atletas inscritos"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isClube
            ? "Desbloqueie o local e o contato dos atletas para iniciar a negociação."
            : "Acompanhe os candidatos das peneiras ativas e suas avaliações."}
        </p>
      </header>

      <div
        role="search"
        aria-label="Filtros de candidatos"
        className="mb-3 flex flex-col gap-3 md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="busca-atletas"
            className="mb-1.5 block text-xs font-semibold text-muted-foreground"
          >
            Buscar atletas
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="busca-atletas"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome, posição ou cidade"
              className="h-11 pl-10 focus-visible:ring-2"
              disabled={carga === "loading"}
            />
          </div>
        </div>
        {!isClube && (
          <div
            role="group"
            aria-label="Filtrar por status"
            className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg2 p-1"
          >
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={status === s.value}
                disabled={carga === "loading"}
                onClick={() => setStatus(s.value)}
                className={
                  "min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 " +
                  (status === s.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-bg3 hover:text-foreground")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contagem anunciada pelo leitor de tela a cada mudança de filtro (WCAG 4.1.3). */}
      <p role="status" aria-live="polite" className="mb-4 min-h-5 text-sm text-muted-foreground">
        {carga === "ok" &&
          `${list.length} ${list.length === 1 ? "atleta encontrado" : "atletas encontrados"}` +
            (temFiltro ? ` de ${realAtletas.length}` : "")}
      </p>

      {carga === "loading" ? (
        <ListaSkeleton />
      ) : carga === "error" ? (
        <EstadoLista
          icon={AlertTriangle}
          tom="erro"
          titulo="Não foi possível carregar os candidatos"
          descricao="Verifique sua conexão e tente de novo."
          acao={
            <Button onClick={() => setTentativa((t) => t + 1)}>
              <RotateCcw aria-hidden="true" />
              Tentar novamente
            </Button>
          }
        />
      ) : isClube ? (
        <ClubeCardsView list={list} />
      ) : list.length === 0 ? (
        temFiltro ? (
          <EstadoLista
            icon={SearchX}
            titulo="Nenhum candidato corresponde aos filtros"
            descricao="Tente outro termo de busca ou outro status."
            acao={
              <Button variant="outline" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <EstadoLista
            icon={Users}
            titulo="Nenhum candidato inscrito ainda"
            descricao="Os atletas aparecem aqui assim que se cadastrarem na plataforma."
          />
        )
      ) : (
        <>
          {/* Celular (< 768px): cartões — a tabela exigiria rolagem lateral. */}
          <ul className="space-y-3 md:hidden" aria-label="Candidatos">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <AtletaLink c={c} className="min-w-0 flex-1">
                  <span className="block truncate">{c.nome}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {c.posicao} · {calcularIdade(c.dataNascimento)} anos · {c.cidade}
                  </span>
                </AtletaLink>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-gold-ink">
                    <span className="sr-only">Nota </span>
                    {c.notaGeral?.toFixed(1) ?? "—"}
                  </span>
                  <CandStatus status={c.status} />
                </div>
                {canScout && (
                  <AcoesAtleta c={c} startingChat={startingChat} onChat={handleStartChat} />
                )}
              </li>
            ))}
          </ul>

          {/* Tablet e desktop: tabela (as colunas cabem a partir de 768px; o overflow é só
              uma proteção para fontes ampliadas). */}
          <div
            className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-card md:block"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                Candidatos inscritos, com posição, idade, cidade, nota e status
              </caption>
              <thead className="bg-bg2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3">Atleta</th>
                  <th scope="col" className="px-5 py-3">Posição</th>
                  <th scope="col" className="px-5 py-3">Idade</th>
                  <th scope="col" className="hidden px-5 py-3 lg:table-cell">Cidade</th>
                  <th scope="col" className="px-5 py-3">Nota</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  {canScout && (
                    <th scope="col" className="px-5 py-3 text-right">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-border transition-colors hover:bg-bg2">
                    <td className="px-5 py-3">
                      <AtletaLink c={c}>{c.nome}</AtletaLink>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.posicao}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {calcularIdade(c.dataNascimento)} anos
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">
                      {c.cidade}
                    </td>
                    <td className="px-5 py-3 font-bold text-gold-ink">
                      {c.notaGeral?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <CandStatus status={c.status} />
                    </td>
                    {canScout && (
                      <td className="px-5 py-3">
                        <AcoesAtleta c={c} startingChat={startingChat} onChat={handleStartChat} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppLayout>
  );
}

/** Link para o perfil do atleta (conta no app) ou do candidato (só inscrição). */
function AtletaLink({
  c,
  className,
  children,
}: {
  c: Candidato;
  className?: string;
  children: React.ReactNode;
}) {
  const cls =
    "flex items-center gap-3 rounded-md font-semibold underline-offset-4 transition-colors hover:text-gold-ink hover:underline active:opacity-70 " +
    (className ?? "");
  // alt="" no avatar: o nome já é o texto do link (evita leitura duplicada).
  const avatar = (
    <AthleteAvatar src={c.avatar} alt="" className="h-9 w-9 shrink-0 border border-border" />
  );
  return c.userId ? (
    <Link to="/atletas/$atletaId" params={{ atletaId: c.userId }} className={cls}>
      {avatar}
      <span className="min-w-0">{children}</span>
    </Link>
  ) : (
    <Link to="/candidatos/$candidatoId" params={{ candidatoId: c.id }} className={cls}>
      {avatar}
      <span className="min-w-0">{children}</span>
    </Link>
  );
}

function AcoesAtleta({
  c,
  startingChat,
  onChat,
}: {
  c: Candidato;
  startingChat: string | null;
  onChat: (c: Candidato) => void;
}) {
  const abrindo = startingChat === c.id;
  return (
    <div className="flex justify-end gap-1">
      {c.userId ? (
        <Button asChild variant="ghost" size="icon" aria-label={`Ver perfil de ${c.nome}`}>
          <Link to="/atletas/$atletaId" params={{ atletaId: c.userId }}>
            <UserCircle2 className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={`${c.nome} não tem conta no app — perfil indisponível`}
          title="Candidato sem conta no app"
        >
          <UserCircle2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
      {c.userId ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={abrindo ? `Abrindo conversa com ${c.nome}…` : `Iniciar conversa com ${c.nome}`}
          aria-busy={abrindo}
          disabled={abrindo}
          onClick={() => onChat(c)}
        >
          {abrindo ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label={`${c.nome} não tem conta no app — não é possível conversar`}
          title="Candidato sem conta no app"
        >
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">Carregando candidatos…</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EstadoLista({
  icon: Icon,
  titulo,
  descricao,
  acao,
  tom,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
  tom?: "erro";
}) {
  return (
    <div
      role={tom === "erro" ? "alert" : undefined}
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-card"
    >
      <Icon
        className={"h-10 w-10 " + (tom === "erro" ? "text-destructive" : "text-muted-foreground")}
        aria-hidden="true"
      />
      <h2 className="mt-4 font-display text-lg font-bold">{titulo}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

function ClubeCardsView({ list }: { list: Candidato[] }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [paying, setPaying] = useState<Candidato | null>(null);
  const [processing, setProcessing] = useState(false);

  const confirmar = async () => {
    if (!paying) return;
    setProcessing(true);
    // Simula processamento de pagamento
    await new Promise((r) => setTimeout(r, 900));
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(paying.id);
      return next;
    });
    setProcessing(false);
    toast.success(`Contato de ${paying.nome} desbloqueado!`);
    setPaying(null);
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-card">
        Nenhum atleta aprovado encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const isUnlocked = unlocked.has(c.id);
          return (
            <article
              key={c.id}
              className="group flex flex-col gap-4 rounded-2xl border-2 border-border bg-card p-5 shadow-card transition-all focus-within:ring-2 focus-within:ring-primary hover:border-primary/40"
              aria-label={`Atleta ${c.nome}`}
            >
              <header className="flex items-start gap-4">
                <AthleteAvatar
                  src={c.avatar}
                  alt={c.nome}
                  className="h-14 w-14 shrink-0 border-2 border-primary/30"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-extrabold leading-tight">
                    {c.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {c.posicao} · {calcularIdade(c.dataNascimento)} anos · {c.altura}cm
                  </p>
                  <Badge className="mt-1 bg-success/15 text-success hover:bg-success/15">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Aprovado
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Nota
                  </p>
                  <p className="font-display text-2xl font-extrabold text-gradient-gold">
                    {c.notaGeral?.toFixed(1) ?? "—"}
                  </p>
                </div>
              </header>

              <dl className="space-y-2 rounded-xl bg-bg2 p-4 text-sm">
                <InfoRow icon={MapPin} label="Local" value={c.cidade} hidden={!isUnlocked} />
                <InfoRow icon={Phone} label="Telefone" value={c.celular} hidden={!isUnlocked} />
                <InfoRow icon={Mail} label="E-mail" value={c.email} hidden={!isUnlocked} />
              </dl>

              {isUnlocked ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Contato desbloqueado
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setPaying(c)}
                  className="h-12 w-full text-base font-bold"
                >
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  {/* Nome acessível começa pelo texto visível (WCAG 2.5.3). */}
                  Desbloquear por R$ 49,99
                  <span className="sr-only"> o contato de {c.nome}</span>
                </Button>
              )}
            </article>
          );
        })}
      </div>

      <Dialog open={!!paying} onOpenChange={(o) => !o && !processing && setPaying(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirmar desbloqueio</DialogTitle>
            <DialogDescription>
              Você terá acesso ao local e aos contatos (telefone e e-mail) de{" "}
              <strong className="text-foreground">{paying?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border bg-bg2 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold text-gradient-gold">
              R$ {PRECO_DESBLOQUEIO.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Pagamento único, acesso imediato
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPaying(null)}
              disabled={processing}
              className="h-11"
            >
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={processing} className="h-11 font-bold">
              {processing ? "Processando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  hidden,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  hidden: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden={true} />
      <dt className="sr-only">{label}</dt>
      <dd className="flex-1 truncate font-medium">
        {hidden ? (
          <span className="select-none blur-sm" aria-label={`${label} bloqueado`}>
            ••••••••••••
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function CandStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente: "bg-muted-foreground/15 text-muted-foreground",
    avaliado: "bg-blue-ink/15 text-blue-ink",
    aprovado: "bg-success/15 text-success",
    reprovado: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    avaliado: "Avaliado",
    aprovado: "Aprovado",
    reprovado: "Reprovado",
  };
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold " + (map[status] ?? "")
      }
    >
      {labels[status] ?? status}
    </span>
  );
}
