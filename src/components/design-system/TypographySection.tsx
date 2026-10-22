import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Escala realmente usada no site (contagem de ocorrências de `text-*` em src/). */
const ESCALA = [
  { cls: "text-xs", uso: "Rótulos, metadados, badges (224 usos)", amostra: "Rótulo e metadado" },
  {
    cls: "text-sm",
    uso: "Texto de interface e corpo curto (305 usos)",
    amostra: "Texto de interface",
  },
  { cls: "text-base", uso: "Corpo de leitura (34 usos)", amostra: "Texto de leitura confortável" },
  { cls: "text-lg", uso: "Destaques e lead (41 usos)", amostra: "Subtítulo de seção" },
  { cls: "text-xl", uso: "Título de card e de seção (38 usos)", amostra: "Título de card" },
  { cls: "text-2xl", uso: "Título de seção (46 usos)", amostra: "Título de seção" },
  { cls: "text-3xl", uso: "Título de página (34 usos)", amostra: "Título de página" },
  { cls: "text-4xl", uso: "Título de página grande (22 usos)", amostra: "Título grande" },
  { cls: "text-5xl", uso: "Hero em telas médias (6 usos)", amostra: "Hero" },
];

const PESOS = [
  { cls: "font-normal", uso: "Texto corrido" },
  { cls: "font-medium", uso: "Botões, links, abas" },
  { cls: "font-semibold", uso: "Subtítulos e rótulos" },
  { cls: "font-bold", uso: "Títulos (mais usado)" },
  { cls: "font-extrabold", uso: "Números e destaques" },
];

export function TypographySection() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Familia
          token="--font-display"
          classe="font-display"
          uso="Todos os títulos (h1–h6, por regra global em styles.css)"
        />
        <Familia
          token="--font-body"
          classe="font-body"
          uso="Texto corrido e interface (definido no body)"
        />
      </div>

      <div className="space-y-1 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h3 className="font-display text-lg font-bold">Escala de tamanhos</h3>
        <ul className="divide-y divide-border">
          {ESCALA.map((e) => (
            <LinhaEscala key={e.cls} {...e} />
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-display text-lg font-bold">Pesos</h3>
          <ul className="space-y-2">
            {PESOS.map((p) => (
              <li key={p.cls} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className={cn("text-lg", p.cls)}>Pelé Next Gen</span>
                <span className="text-xs text-muted-foreground">
                  <code>{p.cls}</code> · {p.uso}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-display text-lg font-bold">Hierarquia de títulos</h3>
          <p className="text-xs text-muted-foreground">
            Cada página tem um único h1; h2 e h3 seguem em ordem, sem pular nível.
          </p>
          <div className="space-y-2">
            <p className="font-display text-3xl font-bold">h1 · Título da página</p>
            <p className="font-display text-2xl font-bold">h2 · Seção</p>
            <p className="font-display text-xl font-semibold">h3 · Subseção ou card</p>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Eyebrow · rótulo de seção
            </p>
            <p className="text-sm text-muted-foreground">Texto de apoio em muted-foreground.</p>
            <p className="text-gradient-gold font-display text-2xl font-extrabold">
              Destaque com gradiente dourado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Familia({ token, classe, uso }: { token: string; classe: string; uso: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [fam, setFam] = useState("—");
  useEffect(() => {
    if (ref.current) setFam(getComputedStyle(ref.current).fontFamily);
  }, []);
  return (
    <div className="min-w-0 space-y-2 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <code className="text-xs">{token}</code>
      <p ref={ref} className={cn("text-4xl font-bold", classe)}>
        Aa Gg 123
      </p>
      <p className="break-words text-xs text-muted-foreground">{fam}</p>
      <p className="text-xs">{uso}</p>
    </div>
  );
}

function LinhaEscala({ cls, uso, amostra }: { cls: string; uso: string; amostra: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [medida, setMedida] = useState("—");
  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setMedida(`${cs.fontSize} / ${cs.lineHeight}`);
  }, []);
  return (
    <li className="space-y-1 py-3">
      <p ref={ref} className={cn(cls, "font-display font-semibold")}>
        {amostra}
      </p>
      <p className="text-xs text-muted-foreground">
        <code>{cls}</code> · {medida} · {uso}
      </p>
    </li>
  );
}
