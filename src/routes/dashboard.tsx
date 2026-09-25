import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { memo, useId, useMemo } from "react";
import { useSession } from "@/lib/session";
import { AlertTriangle, ArrowUpRight, CalendarX2, RotateCcw, Star, TrendingUp, Trophy, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { peneiras, candidatos } from "@/lib/mock-data";
import { Reveal } from "@/components/home/Reveal";

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { name?: string; fill?: string };
};

// Cores dos eixos/grade via tokens: acompanham o tema (os hex fixos antigos davam
// ~2.8:1 no modo claro).
const AXIS_COLOR = "var(--muted-foreground)";
const GRID_COLOR = "var(--border)";

function AccessibleTooltip({
  active,
  payload,
  label,
  unitLabel,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unitLabel: string;
  valueSuffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-xl border-2 border-primary/70 bg-popover px-4 py-3 shadow-2xl ring-1 ring-black/10 dark:ring-black/40"
      style={{ minWidth: 180 }}
    >
      {label !== undefined && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-ink">{label}</p>
      )}
      <ul className="flex flex-col gap-1.5">
        {payload.map((entry, i) => {
          const name = entry.name ?? entry.payload?.name ?? unitLabel;
          const swatch = entry.color ?? entry.payload?.fill ?? "#d4af37";
          return (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-popover-foreground">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full ring-2 ring-foreground/10"
                  style={{ background: swatch }}
                />
                {name}
              </span>
              <span className="text-base font-bold tabular-nums text-popover-foreground">
                {entry.value}
                {valueSuffix}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pelé Next Gen" },
      { name: "description", content: "Visão geral do desempenho dos candidatos." },
    ],
  }),
  errorComponent: DashboardError,
  component: Dashboard,
});

const inscricoesData = [
  { mes: "Jan", inscricoes: 120 },
  { mes: "Fev", inscricoes: 180 },
  { mes: "Mar", inscricoes: 240 },
  { mes: "Abr", inscricoes: 310 },
  { mes: "Mai", inscricoes: 420 },
  { mes: "Jun", inscricoes: 380 },
];

const posicoesData = [
  { name: "Atacante", value: 28 },
  { name: "Meia", value: 22 },
  { name: "Zagueiro", value: 18 },
  { name: "Lateral", value: 15 },
  { name: "Volante", value: 12 },
  { name: "Goleiro", value: 5 },
];

const COLORS = ["#d4af37", "#1a7fd4", "#2ecc71", "#f0d060", "#005baa", "#8a9bb5"];

const desempenhoData = [
  { criterio: "Técnica", media: 7.8 },
  { criterio: "Físico", media: 7.4 },
  { criterio: "Tático", media: 7.1 },
  { criterio: "Psicológico", media: 8.0 },
];

function Dashboard() {
  const { user, ready } = useSession();

  const total = useMemo(() => candidatos.length, []);
  const aprovados = useMemo(() => candidatos.filter((c) => c.status === "aprovado").length, []);
  const pendentes = useMemo(() => candidatos.filter((c) => c.status === "pendente").length, []);
  const peneirasAtivas = useMemo(
    () => peneiras.filter((p) => p.status !== "encerrada").length,
    [],
  );
  const proximasPeneiras = useMemo(
    () => peneiras.filter((p) => p.status !== "encerrada").slice(0, 4),
    [],
  );
  const kpiItems = useMemo(
    () => [
      { icon: Trophy, label: "Peneiras ativas", value: peneirasAtivas, delta: "+2 este mês" },
      { icon: Users, label: "Atletas inscritos", value: total, delta: "+18% vs mês anterior" },
      { icon: Star, label: "Atletas aprovados", value: aprovados, delta: "Taxa 24%" },
      {
        icon: TrendingUp,
        label: "Avaliações pendentes",
        value: pendentes,
        delta: "Próx. peneira em 14 dias",
      },
    ],
    [peneirasAtivas, total, aprovados, pendentes],
  );

  if (ready && user && user.role !== "admin" && user.role !== "suporte") {
    return <Navigate to={user.role === "clube" ? "/clubes" : "/peneiras"} />;
  }

  return (
    <AppLayout>
      <Reveal immediate as="header" className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-ink">
          Painel administrativo
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Visão geral</h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe inscrições, peneiras e desempenho dos candidatos em tempo real.
        </p>
      </Reveal>

      {/* Carregando: enquanto a sessão não resolve, evita mostrar o painel a quem será redirecionado. */}
      {!ready ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section aria-labelledby="kpis-titulo" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <h2 id="kpis-titulo" className="sr-only">
              Indicadores
            </h2>
            {kpiItems.map((kpi, i) => (
              <Reveal key={kpi.label} immediate delay={i * 80}>
                <KPI {...kpi} />
              </Reveal>
            ))}
          </section>

          <Reveal as="section" delay={120} className="mt-8 grid gap-6 xl:grid-cols-3">
            <ChartCard
              className="xl:col-span-2"
              title="Inscrições mensais"
              subtitle="Crescimento de candidatos por mês"
              columns={["Mês", "Inscrições"]}
              rows={inscricoesData.map((d) => [d.mes, d.inscricoes])}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={inscricoesData}>
                  <defs>
                    <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#f0d060" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="mes" stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR }} fontSize={12} />
                  <YAxis stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR }} fontSize={12} width={36} />
                  <Tooltip
                    cursor={{ fill: "rgba(212,175,55,0.08)" }}
                    content={<AccessibleTooltip unitLabel="Inscrições" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="inscricoes"
                    name="Inscrições"
                    stroke="url(#lineGold)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#d4af37" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Posições"
              subtitle="Distribuição dos atletas"
              columns={["Posição", "Atletas (%)"]}
              rows={posicoesData.map((d) => [d.name, d.value])}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={posicoesData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    // O Pie é focável por padrão; aqui o gráfico é só visual (dados na tabela sr-only).
                    rootTabIndex={-1}
                  >
                    {posicoesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<AccessibleTooltip unitLabel="Atletas" />} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal as="section" delay={160} className="mt-6 grid gap-6 xl:grid-cols-3">
            <ChartCard
              className="xl:col-span-2"
              title="Médias por critério"
              subtitle="Avaliação dos candidatos"
              columns={["Critério", "Média (0 a 10)"]}
              rows={desempenhoData.map((d) => [d.criterio, d.media.toFixed(1)])}
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={desempenhoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="criterio" stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR }} fontSize={12} />
                  <YAxis
                    stroke={AXIS_COLOR}
                    tick={{ fill: AXIS_COLOR }}
                    fontSize={12}
                    domain={[0, 10]}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(212,175,55,0.08)" }}
                    content={<AccessibleTooltip unitLabel="Média" valueSuffix=" / 10" />}
                  />
                  <Bar dataKey="media" name="Média" fill="#d4af37" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <section
              aria-labelledby="proximas-titulo"
              className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="proximas-titulo" className="font-display text-lg font-bold">
                  Próximas peneiras
                </h2>
                <Link
                  to="/peneiras"
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-gold-ink underline-offset-4 transition-colors hover:underline active:opacity-70"
                >
                  Ver todas <span className="sr-only">as peneiras</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              {proximasPeneiras.length === 0 ? (
                <EmptyState
                  icon={CalendarX2}
                  title="Nenhuma peneira agendada"
                  description="Quando houver peneiras abertas ou em breve, elas aparecem aqui."
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link to="/peneiras/criar">Criar peneira</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="mt-4 space-y-3">
                  {proximasPeneiras.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/peneiras/$peneiraId"
                        params={{ peneiraId: p.id }}
                        className="flex items-center gap-3 rounded-xl border border-border bg-bg2 p-3 transition-colors hover:border-primary/60 hover:bg-bg3 active:scale-[0.99] focus-visible:border-primary"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          {/* Decorativa: o título da peneira já é o texto do link. */}
                          <img
                            src={p.imagem}
                            alt=""
                            loading="lazy"
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.cidade}/{p.estado} ·{" "}
                            <time dateTime={p.data}>
                              {new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR")}
                            </time>
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        </>
      )}
    </AppLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">Carregando painel…</span>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[124px] rounded-2xl" />
        ))}
      </div>
      <div aria-hidden="true" className="mt-8 grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-[360px] rounded-2xl xl:col-span-2" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardError({ error }: { error: unknown }) {
  const router = useRouter();
  return (
    <AppLayout>
      <div role="alert" className="mx-auto max-w-lg py-16 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold">Não foi possível carregar o painel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Erro inesperado."}
        </p>
        <Button className="mt-6" onClick={() => router.invalidate()}>
          <RotateCcw aria-hidden="true" />
          Tentar novamente
        </Button>
      </div>
    </AppLayout>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const KPI = memo(function KPI({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  label: string;
  value: number;
  delta: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-gold">
      <div className="flex items-center justify-between">
        <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-gold-ink transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-success">{delta}</p>
    </div>
  );
});

/**
 * Card de gráfico. O SVG do Recharts não é legível por leitor de tela, então o gráfico
 * fica aria-hidden e os mesmos dados vão numa tabela sr-only (WCAG 1.1.1 / 1.4.1).
 */
const ChartCard = memo(function ChartCard({
  title,
  subtitle,
  columns,
  rows,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  columns: [string, string];
  rows: (string | number)[][];
  children: React.ReactNode;
  className?: string;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={
        "relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent sm:p-6 " +
        (className ?? "")
      }
    >
      <div className="mb-4">
        <h2 id={titleId} className="font-display text-lg font-bold">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Sem dados no período"
          description="Os números aparecem aqui assim que houver registros."
        />
      ) : (
        <>
          <div aria-hidden="true">{children}</div>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">{columns[0]}</th>
                <th scope="col">{columns[1]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([a, b]) => (
                <tr key={String(a)}>
                  <th scope="row">{a}</th>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
});
