import logoAcademia from "@/assets/home/parceiro-pele-academia.png";
import logoFederacao from "@/assets/home/parceiro-federacao.png";
import logoLitoral from "@/assets/home/parceiro-ct-litoral.png";
import logoBolaRede from "@/assets/home/parceiro-bola-na-rede.png";
import logoLiga from "@/assets/home/parceiro-liga-sub17.png";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Eyebrow, Reveal } from "./Reveal";

const PARCEIROS = [
  { nome: "Pelé Academia", logo: logoAcademia },
  { nome: "Federação Paulista", logo: logoFederacao },
  { nome: "CT Litoral", logo: logoLitoral },
  { nome: "Instituto Bola na Rede", logo: logoBolaRede },
  { nome: "Liga Regional Sub-17", logo: logoLiga },
];

export function Parceiros() {
  // A faixa é duplicada para o loop contínuo; a 2ª cópia é só visual (aria-hidden).
  const loop = [...PARCEIROS, ...PARCEIROS];
  const [paused, setPaused] = useState(false);

  return (
    <section id="parceiros" className="surface-paper scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 lg:py-24">
        <Reveal className="max-w-xl">
          <Eyebrow as="h2">Clubes e parceiros</Eyebrow>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Instituições que organizam peneiras, cedem estrutura e acompanham as avaliações
            registradas na plataforma. Cada relatório pode ser compartilhado com esses parceiros com
            a autorização do atleta.
          </p>
        </Reveal>

        <Reveal
          delay={120}
          className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
          <ul
            data-paused={paused}
            className="marquee-track flex w-max items-center gap-16 group-hover:[animation-play-state:paused]"
          >
            {loop.map((p, i) => (
              <li
                key={`${p.nome}-${i}`}
                className="shrink-0"
                aria-hidden={i >= PARCEIROS.length || undefined}
              >
                <img
                  src={p.logo}
                  alt={i >= PARCEIROS.length ? "" : p.nome}
                  loading="lazy"
                  width={320}
                  height={217}
                  className="h-16 w-auto opacity-55 grayscale transition-all duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 lg:h-20"
                />
              </li>
            ))}
          </ul>
        </Reveal>

        {/* WCAG 2.2.2: a faixa se move continuamente — controle explícito de pausa. */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground active:scale-95"
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {paused ? "Retomar animação" : "Pausar animação"}
          </button>
        </div>
      </div>
    </section>
  );
}
