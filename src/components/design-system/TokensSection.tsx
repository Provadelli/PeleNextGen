import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { contrastRatio, toHex, toRGBA } from "./color-utils";

/* Os nomes de classe ficam escritos por extenso para o Tailwind enxergá-los. */
type ColorToken = { name: string; swatch: string; uso: string };

const GRUPOS_COR: { titulo: string; tokens: ColorToken[] }[] = [
  {
    titulo: "Marca",
    tokens: [
      { name: "gold", swatch: "bg-gold", uso: "Dourado principal (= --primary)" },
      { name: "gold-light", swatch: "bg-gold-light", uso: "Gradientes e realces" },
      {
        name: "gold-dark",
        swatch: "bg-gold-dark",
        uso: "Gradientes; --primary em superfícies claras",
      },
      { name: "gold-ink", swatch: "bg-gold-ink", uso: "Dourado para TEXTO e anel de foco" },
      { name: "blue", swatch: "bg-blue", uso: "Azul da marca (= --secondary)" },
      {
        name: "blue-light",
        swatch: "bg-blue-light",
        uso: "Destaques (= --accent), status em andamento",
      },
      { name: "blue-dark", swatch: "bg-blue-dark", uso: "Fundos profundos e gradiente azul" },
      { name: "blue-ink", swatch: "bg-blue-ink", uso: "Azul para texto pequeno (≥ 4,5:1)" },
    ],
  },
  {
    titulo: "Semânticas",
    tokens: [
      { name: "background", swatch: "bg-background", uso: "Fundo da página" },
      { name: "foreground", swatch: "bg-foreground", uso: "Texto principal" },
      { name: "card", swatch: "bg-card", uso: "Cards e painéis" },
      { name: "popover", swatch: "bg-popover", uso: "Menus, selects e dialogs" },
      { name: "primary", swatch: "bg-primary", uso: "Botão padrão, CTAs" },
      { name: "primary-foreground", swatch: "bg-primary-foreground", uso: "Texto sobre --primary" },
      { name: "secondary", swatch: "bg-secondary", uso: "Botão e badge secundários" },
      { name: "muted", swatch: "bg-muted", uso: "Fundos discretos, abas" },
      { name: "muted-foreground", swatch: "bg-muted-foreground", uso: "Texto de apoio" },
      { name: "accent", swatch: "bg-accent", uso: "Hover de ghost/outline" },
      { name: "destructive", swatch: "bg-destructive", uso: "Ações destrutivas e erro de campo" },
      { name: "border", swatch: "bg-border", uso: "Bordas (com transparência)" },
      { name: "input", swatch: "bg-input", uso: "Borda dos campos (com transparência)" },
      { name: "ring", swatch: "bg-ring", uso: "Anel de foco visível" },
    ],
  },
  {
    titulo: "Estado",
    tokens: [
      { name: "success", swatch: "bg-success", uso: "Sucesso, aberta, contato liberado" },
      { name: "error", swatch: "bg-error", uso: "Erro e reprovado" },
    ],
  },
  {
    titulo: "Superfícies",
    tokens: [
      { name: "bg2", swatch: "bg-bg2", uso: "Superfície elevada (= card no escuro)" },
      { name: "bg3", swatch: "bg-bg3", uso: "Superfície mais alta (= --muted)" },
      { name: "ink", swatch: "bg-ink", uso: "Blocos sempre escuros" },
      { name: "ink-foreground", swatch: "bg-ink-foreground", uso: "Texto sobre --ink" },
    ],
  },
  {
    titulo: "Gráficos",
    tokens: [
      { name: "chart-1", swatch: "bg-chart-1", uso: "Série 1 (dourado)" },
      { name: "chart-2", swatch: "bg-chart-2", uso: "Série 2 (azul claro)" },
      { name: "chart-3", swatch: "bg-chart-3", uso: "Série 3 (verde)" },
      { name: "chart-4", swatch: "bg-chart-4", uso: "Série 4 (dourado claro)" },
      { name: "chart-5", swatch: "bg-chart-5", uso: "Série 5 (azul)" },
    ],
  },
];

/** Pares texto/fundo cujo contraste é medido na própria página. */
const PARES: { fg: string; bg: string }[] = [
  { fg: "foreground", bg: "background" },
  { fg: "muted-foreground", bg: "background" },
  { fg: "muted-foreground", bg: "bg3" },
  { fg: "card-foreground", bg: "card" },
  { fg: "primary-foreground", bg: "primary" },
  { fg: "secondary-foreground", bg: "secondary" },
  { fg: "accent-foreground", bg: "accent" },
  { fg: "destructive-foreground", bg: "destructive" },
  { fg: "ink-foreground", bg: "ink" },
  { fg: "gold-ink", bg: "background" },
  { fg: "blue-ink", bg: "background" },
  { fg: "success", bg: "background" },
  { fg: "error", bg: "background" },
];

const ESPACOS = [
  { cls: "w-1", nome: "1" },
  { cls: "w-2", nome: "2" },
  { cls: "w-3", nome: "3" },
  { cls: "w-4", nome: "4" },
  { cls: "w-6", nome: "6" },
  { cls: "w-8", nome: "8" },
  { cls: "w-12", nome: "12" },
  { cls: "w-16", nome: "16" },
];

const RAIOS = [
  { cls: "rounded-sm", uso: "Detalhes pequenos" },
  { cls: "rounded-md", uso: "Botões, inputs, badges" },
  { cls: "rounded-lg", uso: "Alertas, abas" },
  { cls: "rounded-xl", uso: "Cards, PeneiraCard" },
  { cls: "rounded-2xl", uso: "Painéis e KPIs" },
  { cls: "rounded-3xl", uso: "Blocos de destaque" },
  { cls: "rounded-full", uso: "Avatar, StatusBadge, pílulas" },
];

const SOMBRAS = [
  { cls: "shadow-sm", uso: "Inputs e botões secundários" },
  { cls: "shadow", uso: "Botão padrão e badges" },
  { cls: "shadow-card", uso: "Cards (token --shadow-card)" },
  { cls: "shadow-gold", uso: "Foco e hover de destaque (token --shadow-gold)" },
];

export function TokensSection() {
  return (
    <div className="space-y-10">
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Os valores abaixo <strong className="text-foreground">não são digitados à mão</strong>: cada
        amostra usa a classe Tailwind do token e o valor é lido com <code>getComputedStyle</code> no
        navegador. Os dois painéis forçam o tema claro (<code>.light</code>) e o escuro (
        <code>.dark</code>), independentemente do tema escolhido para a página.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <ThemePanel tema="light" titulo="Tema claro" />
        <ThemePanel tema="dark" titulo="Tema escuro" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Escala
          titulo="Espaçamento"
          nota="Escala do Tailwind (múltiplos de 0,25rem). Mais usados: gap-2, gap-3, p-6, p-4."
        >
          {ESPACOS.map((e) => (
            <li key={e.cls} className="flex items-center gap-3">
              <code className="w-8 shrink-0 text-xs">{e.nome}</code>
              <Medida cls={cn(e.cls, "h-3 rounded-sm bg-primary")} read={lerLargura} />
            </li>
          ))}
        </Escala>

        <Escala titulo="Raios" nota="Derivados de --radius (0,75rem) em @theme.">
          {RAIOS.map((r) => (
            <li key={r.cls} className="flex items-center gap-3">
              <Medida
                cls={cn(r.cls, "h-10 w-10 shrink-0 border-2 border-primary bg-primary/15")}
                read={lerRaio}
              />
              <span className="min-w-0 text-xs">
                <code>{r.cls}</code>
                <span className="block">{r.uso}</span>
              </span>
            </li>
          ))}
        </Escala>

        <Escala
          titulo="Sombras"
          nota="shadow-card e shadow-gold vêm dos tokens --shadow-card e --shadow-gold."
        >
          {SOMBRAS.map((s) => (
            <li key={s.cls} className="space-y-1">
              <Medida
                cls={cn(s.cls, "h-12 rounded-xl border border-border bg-background")}
                read={lerSombra}
                stacked
                after
              />
              <p className="text-xs">
                <code>{s.cls}</code> — {s.uso}
              </p>
            </li>
          ))}
        </Escala>
      </div>
    </div>
  );
}

function ThemePanel({ tema, titulo }: { tema: "light" | "dark"; titulo: string }) {
  return (
    <div
      className={cn(
        tema,
        "min-w-0 space-y-8 rounded-2xl border border-border bg-background p-4 text-foreground sm:p-6",
      )}
    >
      <h3 className="font-display text-xl font-bold">{titulo}</h3>
      {GRUPOS_COR.map((g) => (
        <div key={g.titulo} className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {g.titulo}
          </h4>
          <ul className="space-y-2">
            {g.tokens.map((t) => (
              <TokenRow key={t.name} token={t} />
            ))}
          </ul>
        </div>
      ))}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contraste do texto (WCAG 2.1)
        </h4>
        <ul className="space-y-2">
          {PARES.map((p) => (
            <ContrastRow key={`${p.fg}-${p.bg}`} fg={p.fg} bg={p.bg} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function TokenRow({ token }: { token: ColorToken }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [info, setInfo] = useState<{ hex: string; raw: string } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const rgba = toRGBA(cs.backgroundColor);
    setInfo({
      hex: rgba
        ? rgba.a < 1
          ? `${toHex(rgba)} · ${Math.round(rgba.a * 100)}%`
          : toHex(rgba)
        : "—",
      raw: cs.getPropertyValue(`--${token.name}`).trim() || "—",
    });
  }, [token.name]);

  return (
    <li className="flex items-start gap-3">
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          "mt-0.5 h-10 w-10 shrink-0 rounded-md border border-foreground/20",
          token.swatch,
        )}
      />
      <div className="min-w-0 text-sm">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <code className="font-semibold">--{token.name}</code>
          <span className="text-xs text-muted-foreground">{info?.hex ?? "—"}</span>
        </p>
        <p className="break-words text-xs text-muted-foreground">{info?.raw ?? "—"}</p>
        <p className="text-xs">
          <code>{token.swatch}</code> · {token.uso}
        </p>
      </div>
    </li>
  );
}

function ContrastRow({ fg, bg }: { fg: string; bg: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const f = toRGBA(cs.color);
    const b = toRGBA(cs.backgroundColor);
    if (f && b) setRatio(contrastRatio(f, b));
  }, [fg, bg]);

  const nivel =
    ratio === null
      ? ""
      : ratio >= 7
        ? "AAA"
        : ratio >= 4.5
          ? "AA"
          : ratio >= 3
            ? "só texto grande"
            : "reprova";
  return (
    <li className="flex items-center gap-3 text-sm">
      <span
        ref={ref}
        style={{ color: `var(--${fg})`, backgroundColor: `var(--${bg})` }}
        className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-foreground/20 font-bold"
      >
        Aa
      </span>
      <code className="min-w-0 flex-1 break-words text-xs">
        --{fg} / --{bg}
      </code>
      <span className="shrink-0 text-right text-xs font-semibold tabular-nums">
        {ratio === null ? "—" : `${ratio.toFixed(2)}:1`}
        <span className="block font-normal text-muted-foreground">{nivel}</span>
      </span>
    </li>
  );
}

function Escala({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h3 className="font-display text-lg font-bold">{titulo}</h3>
      <p className="text-xs text-muted-foreground">{nota}</p>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

/** Amostra renderizada com a classe Tailwind + o valor CSS real que ela produz. */
function Medida({
  cls,
  read,
  stacked,
  after,
}: {
  cls: string;
  read: (cs: CSSStyleDeclaration, el: HTMLElement) => string;
  stacked?: boolean;
  after?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState("—");
  useEffect(() => {
    if (ref.current) setV(read(getComputedStyle(ref.current), ref.current));
  }, [read]);
  const valor = <span className="min-w-0 break-words text-[11px] text-muted-foreground">{v}</span>;
  if (after) {
    return (
      <>
        <div ref={ref} aria-hidden="true" className={cls} />
        {valor}
      </>
    );
  }
  return (
    <>
      <div ref={ref} aria-hidden="true" className={cls} />
      {!stacked && valor}
      {stacked && <span className="sr-only">{v}</span>}
    </>
  );
}

const lerLargura = (_: CSSStyleDeclaration, el: HTMLElement) =>
  `${el.offsetWidth}px · ${el.offsetWidth / 16}rem`;
const lerRaio = (cs: CSSStyleDeclaration) => cs.borderTopLeftRadius;
const lerSombra = (cs: CSSStyleDeclaration) => {
  const s = cs.boxShadow;
  return s === "none" ? "nenhuma" : s;
};
