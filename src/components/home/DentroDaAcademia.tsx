import imgCamisa from "@/assets/home/time-camisa.jpg";
import imgAcao from "@/assets/home/time-acao.jpg";
import imgNoturno from "@/assets/home/time-noturno.jpg";
import imgGrupo from "@/assets/home/time-grupo.jpg";
import imgLegadoHoje from "@/assets/home/legado-hoje.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { StoryCarousel, type StoryItem } from "./StoryCarousel";

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

const ACADEMIA_ITEMS: StoryItem[] = SLIDES.map((s) => ({
  img: s.img,
  alt: s.titulo,
  kicker: s.tag,
  titulo: s.titulo,
  texto: s.texto,
}));

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
            Navegue pelas etapas da rotina de formação — do treino individual ao momento em que o
            clube entra em contato.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 lg:px-10 lg:pb-32">
        <Reveal delay={120}>
          <StoryCarousel
            items={ACADEMIA_ITEMS}
            nav="tabs"
            imageSide="right"
            label="Etapas da rotina de formação"
          />
        </Reveal>
      </div>
    </section>
  );
}
