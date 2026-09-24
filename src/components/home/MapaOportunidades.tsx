import { useMemo, useState } from "react";
import type { Peneira } from "@/lib/mock-data";
import { BR_STATE_PATHS, BR_VIEWBOX } from "@/lib/br-map-paths";
import { useCountUp } from "@/hooks/use-count-up";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal } from "./Reveal";
import { VerTodasLink } from "./VerTodasLink";

const [, , VB_W, VB_H] = BR_VIEWBOX.split(" ").map(Number);

/** Minicard de estado: vidro fosco, contagem animada e barra proporcional ao líder. */
function EstadoCard({
  uf,
  nome,
  n,
  max,
  rank,
  ativo,
  onEnter,
  onLeave,
}: {
  uf: string;
  nome: string;
  n: number;
  max: number;
  rank: number;
  ativo: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [valor, ref] = useCountUp(n, 1100);
  const pct = Math.max(8, Math.round((n / max) * 100));

  return (
    <button
      ref={ref as never}
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onEnter}
      aria-label={`${nome}: ${n} peneira${n > 1 ? "s" : ""} ativa${n > 1 ? "s" : ""}`}
      className={cn(
        "group/uf relative overflow-hidden rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        ativo
          ? "-translate-y-1 border-primary/70 bg-card shadow-gold"
          : "border-border bg-card/50 hover:border-primary/40",
      )}
    >
      {/* Brilho dourado de canto quando ativo. */}
      <span
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/25 blur-2xl transition-opacity duration-500",
          ativo ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="relative flex items-center justify-between">
        <span className="font-display text-sm font-extrabold tracking-[0.18em] text-foreground">
          {uf}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          #{rank}
        </span>
      </span>
      <span className="relative mt-3 flex items-end justify-between gap-2">
        <span className="font-display text-3xl font-extrabold leading-none tabular-nums text-primary">
          {String(valor).padStart(2, "0")}
        </span>
        <span className="truncate pb-0.5 text-[10px] text-muted-foreground">{nome}</span>
      </span>
      <span className="relative mt-3 block h-1 overflow-hidden rounded-full bg-foreground/10">
        <span
          className={cn(
            "block h-full rounded-full bg-gradient-to-r from-gold-dark via-primary to-gold-light transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          )}
          style={{ width: ativo ? "100%" : `${pct}%` }}
        />
      </span>
    </button>
  );
}

export function MapaOportunidades({ peneiras }: { peneiras: Peneira[] }) {
  const [ativoUf, setAtivoUf] = useState<string | null>(null);
  const { ref: mapRef, shown: mapShown } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  const porUf = useMemo(() => {
    const m = new Map<string, number>();
    peneiras
      .filter((p) => p.status !== "encerrada")
      .forEach((p) => m.set(p.estado, (m.get(p.estado) ?? 0) + 1));
    return m;
  }, [peneiras]);

  const max = useMemo(() => Math.max(1, ...[...porUf.values()]), [porUf]);

  const top = useMemo(
    () => [...porUf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    [porUf],
  );

  const totalAtivas = useMemo(() => [...porUf.values()].reduce((s, n) => s + n, 0), [porUf]);

  const estadoAtivo = BR_STATE_PATHS.find((s) => s.uf === ativoUf);
  const nAtivo = ativoUf ? (porUf.get(ativoUf) ?? 0) : 0;
  const nomeUf = (uf: string) => BR_STATE_PATHS.find((s) => s.uf === uf)?.nome ?? uf;

  return (
    <section id="mapa" className="relative isolate scroll-mt-16 overflow-hidden border-y border-border bg-bg2/40">
      {/* Textura de pontos + brilho dourado atrás do mapa. */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute right-[8%] top-1/2 -z-10 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--gold)_16%,transparent),transparent_65%)] blur-2xl" />

      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
        <div>
          <Reveal>
            <Eyebrow>Mapa de oportunidades</Eyebrow>
            <h2 className="mt-6 max-w-md font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              O talento está espalhado. A avaliação <span className="text-gradient-gold">também</span>.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Os estados destacados em dourado têm peneiras ativas cadastradas agora —{" "}
              <span className="font-semibold text-foreground tabular-nums">{totalAtivas}</span> no
              total. O mapa é atualizado automaticamente conforme novas peneiras entram no sistema.
            </p>
          </Reveal>

          {top.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">Novas regiões em breve.</p>
          ) : (
            <Reveal stagger delay={120} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {top.map(([uf, n], i) => (
                <EstadoCard
                  key={uf}
                  uf={uf}
                  nome={nomeUf(uf)}
                  n={n}
                  max={max}
                  rank={i + 1}
                  ativo={ativoUf === uf}
                  onEnter={() => setAtivoUf(uf)}
                  onLeave={() => setAtivoUf(null)}
                />
              ))}
            </Reveal>
          )}
        </div>

        <Reveal delay={140} variant="scale">
          <div ref={mapRef} className="relative mx-auto w-full max-w-[34rem]">
            <svg
              viewBox={BR_VIEWBOX}
              className="h-auto w-full overflow-visible drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
              role="img"
              aria-label="Mapa do Brasil com os estados que têm peneiras ativas"
            >
              <defs>
                <linearGradient id="map-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gold-light)" />
                  <stop offset="55%" stopColor="var(--gold)" />
                  <stop offset="100%" stopColor="var(--gold-dark)" />
                </linearGradient>
                <filter id="map-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {BR_STATE_PATHS.map((s, i) => {
                const n = porUf.get(s.uf) ?? 0;
                const ativo = n > 0;
                const destaque = ativoUf === s.uf;
                const intensidade = ativo ? 0.45 + (n / max) * 0.55 : 1;
                return (
                  <path
                    key={s.uf}
                    d={s.d}
                    onMouseEnter={() => setAtivoUf(s.uf)}
                    onMouseLeave={() => setAtivoUf(null)}
                    // Toque no celular (sem hover real): fixa o destaque no estado tocado.
                    onClick={() => setAtivoUf(s.uf)}
                    className={cn(
                      "[transform-box:fill-box] [transform-origin:center] motion-reduce:transition-none",
                      ativo && "cursor-pointer",
                    )}
                    style={{
                      fill: ativo
                        ? "url(#map-gold)"
                        : "color-mix(in oklab, var(--foreground) 7%, transparent)",
                      fillOpacity: destaque ? 1 : intensidade,
                      stroke: destaque
                        ? "var(--gold-light)"
                        : "color-mix(in oklab, var(--background) 85%, transparent)",
                      strokeWidth: destaque ? 3 : 1.6,
                      strokeLinejoin: "round",
                      filter: destaque ? "url(#map-glow)" : undefined,
                      opacity: mapShown ? 1 : 0,
                      transform: mapShown
                        ? destaque
                          ? "translateY(-4px) scale(1.04)"
                          : "none"
                        : "translateY(14px) scale(0.96)",
                      transition: `opacity .7s ${i * 18}ms, transform .6s cubic-bezier(0.16,1,0.3,1) ${
                        destaque ? 0 : i * 18
                      }ms, fill-opacity .3s, stroke .3s, stroke-width .3s`,
                    }}
                  />
                );
              })}

              {/* O estado em destaque é redesenhado por cima para o brilho não ser cortado. */}
              {estadoAtivo && (porUf.get(estadoAtivo.uf) ?? 0) > 0 && (
                <path
                  d={estadoAtivo.d}
                  pointerEvents="none"
                  className="[transform-box:fill-box] [transform-origin:center]"
                  style={{
                    fill: "url(#map-gold)",
                    stroke: "var(--gold-light)",
                    strokeWidth: 3,
                    filter: "url(#map-glow)",
                    transform: "translateY(-4px) scale(1.04)",
                  }}
                />
              )}

              {/* Pulso nos estados com peneiras. */}
              {BR_STATE_PATHS.filter((s) => (porUf.get(s.uf) ?? 0) > 0).map((s, i) => (
                <g key={`p-${s.uf}`} pointerEvents="none">
                  <circle
                    cx={s.cx}
                    cy={s.cy - 18}
                    r={4}
                    className="map-ping"
                    style={{ fill: "none", stroke: "var(--gold-light)", strokeWidth: 2, animationDelay: `${i * 0.35}s` }}
                  />
                  <circle cx={s.cx} cy={s.cy - 18} r={4.5} style={{ fill: "var(--background)", stroke: "var(--gold-dark)", strokeWidth: 2 }} />
                  <text
                    x={s.cx}
                    y={s.cy + 10}
                    textAnchor="middle"
                    className="fill-foreground text-[19px] font-bold tracking-[0.06em]"
                  >
                    {s.uf}
                  </text>
                </g>
              ))}
            </svg>

            {estadoAtivo && (
              <div
                className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-[calc(100%+14px)] animate-in fade-in zoom-in-95 rounded-2xl border border-primary/40 bg-background/80 px-4 py-2.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl duration-200"
                style={{
                  // Preso entre 15% e 85% para não ser cortado nas bordas no celular.
                  left: `${Math.min(85, Math.max(15, (estadoAtivo.cx / VB_W) * 100))}%`,
                  top: `${(estadoAtivo.cy / VB_H) * 100 - 1}%`,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  {estadoAtivo.nome}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {nAtivo > 0
                    ? `${nAtivo} peneira${nAtivo > 1 ? "s" : ""} ativa${nAtivo > 1 ? "s" : ""}`
                    : "Sem peneiras no momento"}
                </p>
                <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-primary/40 bg-background/80" />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gradient-gold shadow-gold" /> Com peneiras
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-foreground/10" /> Em breve
              </span>
            </div>

            <div className="mt-4 flex justify-center">
              <VerTodasLink>Ver todas as peneiras</VerTodasLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
