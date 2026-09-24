import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Peneira } from "@/lib/mock-data";
import { Reveal } from "./Reveal";
import { AuthLink } from "./AuthLink";
import { ProximaPeneiraCard } from "./ProximaPeneiraCard";
import { TypewriterTitle, type TitlePart } from "./TypewriterTitle";
import heroAtleta from "@/assets/home/hero-atleta.jpg";
import campoAcao from "@/assets/home/time-acao.jpg";

const HERO_TITLE: TitlePart[] = [
  { text: "O talento existe.", br: true },
  { text: "Falta a " },
  { text: "oportunidade", gold: true },
  { text: "." },
];

function HeroBackgroundMedia() {
  const [reduced, setReduced] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Enquadramento: o vídeo (16:9) ocupa só a primeira tela — no celular a seção fica
  // bem mais alta que a tela e o vídeo ficaria ampliado demais. O foco fica levemente
  // abaixo do centro (gramado e círculo central), que é o assunto do sobrevoo.
  const mediaCls = "h-full w-full object-cover object-[50%_58%] opacity-55";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-x-0 top-0 h-[100svh] lg:h-full">
        {reduced ? (
          <img src={heroAtleta} alt="" aria-hidden="true" className={mediaCls} />
        ) : videoFailed ? (
          <img src={campoAcao} alt="" aria-hidden="true" className={mediaCls} />
        ) : (
          <video
            src="/videos/hero-background.mp4"
            poster={heroAtleta}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            className={mediaCls}
          />
        )}
        {/* Celular: funde a base do vídeo no fundo escuro (o conteúdo continua abaixo). */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent lg:hidden" />
      </div>
      {/* Leitura: no celular o texto fica sobre o vídeo inteiro (degradê vertical);
          no desktop o texto fica à esquerda (degradê horizontal). */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/80 lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/55 lg:to-ink/20" />
    </div>
  );
}

export function Hero({ proxima, loading }: { proxima: Peneira | null; loading: boolean }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-border">
      <HeroBackgroundMedia />
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-10 px-6 pb-16 pt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="flex flex-col justify-center">
          <Reveal immediate>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              <span className="h-px w-10 bg-primary/60" />
              Pelé Scout · Plataforma oficial
            </p>
          </Reveal>

          <TypewriterTitle
            parts={HERO_TITLE}
            className="mt-7 max-w-[16ch] font-display text-[2.4rem] font-extrabold min-[400px]:text-[2.75rem] leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl lg:text-[5.25rem]"
          />

          <Reveal immediate delay={240}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-white/70">
              O Pelé Scout conecta atletas a peneiras oficiais e a olheiros que avaliam, registram e
              acompanham cada passo da sua trajetória. Você se inscreve em minutos, participa da
              avaliação presencial e recebe um relatório com notas técnicas, físicas e táticas —
              tudo guardado no seu perfil para os clubes verem.
            </p>
          </Reveal>

          <Reveal immediate delay={360}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <AuthLink
                href="/peneiras"
                className="group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-gold transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                Encontrar minha peneira
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </AuthLink>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white/90 transition-colors hover:border-primary hover:text-primary"
              >
                Como funciona
              </a>
            </div>
          </Reveal>

          <Reveal immediate delay={480}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3 border-t sm:gap-6 border-white/15 pt-6">
              {[
                ["Gratuito", "para o atleta"],
                ["Olheiros", "credenciados"],
                ["Relatório", "após a avaliação"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-base font-extrabold text-primary sm:text-lg">{a}</dt>
                  <dd className="mt-1 text-xs text-white/60">{b}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal immediate delay={300} className="relative">
          <ProximaPeneiraCard peneira={proxima} loading={loading} />
        </Reveal>
      </div>
    </section>
  );
}
