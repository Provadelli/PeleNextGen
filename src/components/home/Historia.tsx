import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import imgGrupo from "@/assets/home/time-grupo.jpg";
import imgAcao from "@/assets/home/time-acao.jpg";
import imgNoturno from "@/assets/home/time-noturno.jpg";
import imgCamisa from "@/assets/home/time-camisa.jpg";
import imgLegadoHoje from "@/assets/home/legado-hoje.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { useTilt } from "@/hooks/use-tilt";
import { cn } from "@/lib/utils";

const MARCOS = [
  {
    ano: "1969",
    titulo: "A origem",
    texto:
      "Nasce a formação de base que carrega o nome de Pelé: ensinar futebol como ofício, disciplina e caminho.",
    citacao: '"Ensinar futebol como ofício."',
    img: imgGrupo,
    alt: "Elenco reunido em campo antes da partida",
  },
  {
    ano: "Desenvolvimento",
    titulo: "Metodologia própria",
    texto:
      "Treinamento estruturado por categoria, avaliação técnica constante e acompanhamento individual de cada atleta.",
    citacao: '"Cada atleta, um plano."',
    img: imgAcao,
    alt: "Atleta disputando lance durante uma partida",
  },
  {
    ano: "Expansão",
    titulo: "Do bairro ao país",
    texto:
      "Peneiras em diferentes estados ampliam o alcance e levam a avaliação para onde o talento está.",
    citacao: '"O talento não escolhe CEP."',
    img: imgNoturno,
    alt: "Partida noturna em estádio cheio",
  },
  {
    ano: "Presente",
    titulo: "Pelé Scout",
    texto:
      "A avaliação vira dado: olheiros registram desempenho, o atleta acompanha sua evolução e clubes encontram quem procuram.",
    citacao: '"A avaliação virou dado."',
    img: imgCamisa,
    alt: "Camisa oficial do time com a bola de jogo",
  },
  {
    ano: "Hoje",
    titulo: "Na prática",
    texto:
      "Cada treino registrado é um passo a mais no perfil do atleta — visível para olheiros e clubes em todo o país.",
    citacao: '"O próximo capítulo já começou."',
    img: imgLegadoHoje,
    alt: "Atleta em treino, retrato atual da academia",
  },
];

const AUTOPLAY_MS = 3500;

export function Historia() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const dragX = useRef<number | null>(null);
  const { ref: tiltRef, tiltProps } = useTilt<HTMLDivElement>(4);

  const go = useCallback((n: number) => {
    setI((prev) => (n + MARCOS.length) % MARCOS.length);
  }, []);

  useEffect(() => {
    if (pausado) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = window.setInterval(() => setI((p) => (p + 1) % MARCOS.length), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [pausado]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "ArrowRight") go(i + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  const atual = MARCOS[i];

  return (
    <section id="legado" className="border-y border-border bg-bg2/40 scroll-mt-24">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Legado</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-[3.25rem]">
            Existe história por trás desta oportunidade.
          </h2>
        </Reveal>

        <Reveal
          delay={120}
          className="mt-14 overflow-hidden rounded-3xl border border-border shadow-card"
        >
          <div
            className="grid touch-pan-y gap-0 bg-ink text-ink-foreground lg:grid-cols-[1fr_1.1fr]"
            onPointerDown={(e) => (dragX.current = e.clientX)}
            onPointerUp={(e) => {
              if (dragX.current === null) return;
              const d = e.clientX - dragX.current;
              if (Math.abs(d) > 50) go(d < 0 ? i + 1 : i - 1);
              dragX.current = null;
            }}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            <div
              key={atual.ano}
              className="flex flex-col justify-center p-8 lg:p-12 animate-fade-in"
            >
              <p className="font-display text-2xl font-extrabold text-primary lg:text-3xl">
                {atual.ano}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-ink-foreground lg:text-2xl">
                {atual.titulo}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/70">
                {atual.texto}
              </p>
              <p className="mt-6 font-display text-lg italic text-gold-light">{atual.citacao}</p>
            </div>

            <div
              ref={tiltRef}
              {...tiltProps}
              className="relative min-h-[260px] overflow-hidden [perspective:1200px]"
            >
              <img
                key={atual.img}
                src={atual.img}
                alt={atual.alt}
                loading={i === 0 ? "eager" : "lazy"}
                width={900}
                height={700}
                className="absolute inset-0 h-full w-full animate-fade-in object-cover saturate-[0.85] contrast-[1.05] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                style={
                  {
                    transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
                  } as CSSProperties
                }
              />
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 motion-reduce:hidden"
                style={{
                  background:
                    "radial-gradient(280px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--primary) 30%, transparent), transparent 65%)",
                }}
              />
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex gap-2">
          {MARCOS.map((m, idx) => (
            <button
              key={m.ano}
              type="button"
              aria-label={`Ir para ${m.ano}`}
              onClick={() => go(idx)}
              className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/15"
            >
              <span
                className={cn(
                  "block h-full rounded-full bg-primary",
                  idx === i
                    ? "w-full transition-[width] duration-[3500ms] ease-linear"
                    : idx < i
                      ? "w-full"
                      : "w-0",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
