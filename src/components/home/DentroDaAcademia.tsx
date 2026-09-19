import imgCamisa from "@/assets/home/time-camisa.jpg";
import imgAcao from "@/assets/home/time-acao.jpg";
import imgNoturno from "@/assets/home/time-noturno.jpg";
import imgGrupo from "@/assets/home/time-grupo.jpg";
import imgLegadoHoje from "@/assets/home/legado-hoje.jpg";
import { Eyebrow, Reveal } from "./Reveal";

const SLIDES = [
  {
    img: imgCamisa,
    tag: "Treino",
    titulo: "Disciplina antes do resultado.",
    texto:
      "Antes de qualquer avaliação existe rotina: fundamentos, repetição e cuidado com o corpo. É esse trabalho invisível que aparece nos 90 minutos em que o olheiro está olhando.",
  },
  {
    img: imgAcao,
    tag: "Desenvolvimento",
    titulo: "Cada posição tem um caminho.",
    texto:
      "Goleiros, laterais, meias e atacantes são observados por critérios diferentes. A plataforma registra a avaliação por competência, e não uma nota única e genérica.",
  },
  {
    img: imgNoturno,
    tag: "Sonho",
    titulo: "Todo talento merece uma oportunidade.",
    texto:
      "Muita gente boa nunca foi vista simplesmente porque não sabia onde e quando acontecia a próxima peneira. Aqui essa informação é pública e organizada.",
  },
  {
    img: imgGrupo,
    tag: "Coletivo",
    titulo: "O jogo mostra o que o teste esconde.",
    texto:
      "As peneiras são estruturadas em jogos reais, com tempo e número de participantes definidos, para que cada atleta tenha minutos de verdade em campo.",
  },
  {
    img: imgLegadoHoje,
    tag: "Caminho",
    titulo: "O próximo passo começa aqui.",
    texto:
      "Depois da avaliação, o atleta recebe o feedback do olheiro no próprio perfil e passa a aparecer nas buscas de clubes que procuram exatamente aquele perfil.",
  },
];

export function DentroDaAcademia() {
  return (
    <section id="academia" className="scroll-mt-16">
      <div className="mx-auto max-w-[1400px] px-6 pt-24 lg:px-10 lg:pt-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Dentro da academia</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-5xl">
            O que acontece entre a inscrição e o contrato.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Role para percorrer as etapas da rotina de formação — do treino individual ao momento em
            que o clube entra em contato.
          </p>
        </Reveal>
      </div>

      <div className="mt-12">
        {SLIDES.map((s, idx) => (
          <div
            key={s.tag}
            className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 md:px-0"
            style={{ zIndex: idx + 1 }}
          >
            <div className="relative flex h-[70vh] w-full max-w-[1200px] items-end overflow-hidden rounded-3xl border border-border shadow-card sm:h-[560px]">
              <img
                src={s.img}
                alt={s.titulo}
                loading={idx === 0 ? "eager" : "lazy"}
                width={1600}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover saturate-[0.85] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-transparent" />

              <div className="relative z-10 p-8 sm:p-12 lg:p-14">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                  {s.tag}
                </span>
                <h3 className="mt-4 max-w-lg font-display text-2xl font-extrabold leading-tight text-white lg:text-4xl">
                  {s.titulo}
                </h3>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">{s.texto}</p>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 tabular-nums">
                  {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
