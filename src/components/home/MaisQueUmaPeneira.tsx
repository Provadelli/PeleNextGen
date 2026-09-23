import { Link } from "@tanstack/react-router";
import { Eye, Handshake, Radar } from "lucide-react";
import peleBg from "@/assets/home/pele.jpeg";
import { Eyebrow, Reveal } from "./Reveal";
import { GoldButton } from "./GoldButton";

const PILARES = [
  {
    icon: Radar,
    titulo: "Descobrir",
    texto: "Peneiras oficiais perto de você — do campinho à cidade grande, ninguém fica de fora.",
  },
  {
    icon: Eye,
    titulo: "Avaliar",
    texto: "Olheiros credenciados medem técnica, físico, tática e mental com critério profissional.",
  },
  {
    icon: Handshake,
    titulo: "Conectar",
    texto: "Seu perfil e sua evolução chegam aos clubes. O próximo passo começa com um contato.",
  },
];

/** Seção 2 — o propósito da plataforma: dar oportunidade a quem nunca foi visto. */
export function MaisQueUmaPeneira() {
  return (
    <section
      id="proposito"
      className="relative isolate flex min-h-[100svh] scroll-mt-16 items-center overflow-hidden bg-ink text-white"
    >
      {/* Fundo total: Pelé coroando o garoto — o talento escondido sendo descoberto. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {/* No desktop a foto ocupa a direita: Pelé e o garoto ficam ao lado do texto, não atrás dele. */}
        <div className="absolute inset-0 lg:left-[30%]">
          <img
            src={peleBg}
            alt=""
            loading="lazy"
            width={2200}
            height={1228}
            className="parallax-bg h-full w-full object-cover object-[58%_center] lg:object-[40%_center]"
          />
        </div>
        {/* Leitura do texto: escurece a esquerda e a base, preserva a coroa e os rostos. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20 lg:from-ink lg:from-30% lg:via-ink/40 lg:via-50% lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>A plataforma de peneiras</Eyebrow>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Todo craque já foi um{" "}
              <span className="relative whitespace-nowrap text-primary">
                talento escondido
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-[3px] w-full origin-left rounded-full bg-primary/70"
                />
              </span>
              .
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Existem milhares de garotos e garotas jogando no campinho, na várzea e na escola que
              nunca foram vistos por um olheiro. O Pelé Next Gen existe para mudar isso: levar a
              peneira até eles, avaliar com critério profissional e colocar cada talento na vitrine
              dos clubes.
            </p>
            <p className="mt-5 max-w-xl font-display text-xl font-bold leading-snug text-white sm:text-2xl">
              Talento existe em todo lugar. O que falta é{" "}
              <span className="text-gradient-gold">oportunidade</span> — e ela começa aqui.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <GoldButton href="/cadastro">Quero ser descoberto</GoldButton>
              <Link
                to="/registro-clube"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                Sou um clube
              </Link>
            </div>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3 lg:mt-24 lg:max-w-5xl">
          {PILARES.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal as="li" key={titulo} delay={i * 120}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/60 hover:bg-white/[0.1] hover:shadow-[0_20px_60px_-20px] hover:shadow-primary/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-xs font-bold uppercase tracking-[0.24em] text-white/50">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{texto}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
