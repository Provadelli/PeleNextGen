import imgGrupo from "@/assets/home/time-grupo.jpg";
import imgDesenvolvimento from "@/assets/home/desenvolvimento.jpeg";
import imgExpansao from "@/assets/home/expansao.jpeg";
import imgCamisa from "@/assets/home/time-camisa.jpg";
import imgLegadoHoje from "@/assets/home/legado-hoje.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { StoryCarousel, type StoryItem } from "./StoryCarousel";

const MARCOS = [
  {
    ano: "1969",
    titulo: "A origem",
    texto:
      "Nasce a formação de base que carrega o nome de Pelé: ensinar futebol como ofício, disciplina e caminho.",
    citacao: "Ensinar futebol como ofício.",
    img: imgGrupo,
    alt: "Elenco reunido em campo antes da partida",
  },
  {
    ano: "Desenvolvimento",
    titulo: "Metodologia própria",
    texto:
      "Treinamento estruturado por categoria, avaliação técnica constante e acompanhamento individual de cada atleta.",
    citacao: "Cada atleta, um plano.",
    img: imgDesenvolvimento,
    alt: "Atletas em treino técnico com escada de agilidade e cones no campo",
  },
  {
    ano: "Expansão",
    titulo: "Do bairro ao país",
    texto:
      "Peneiras em diferentes estados ampliam o alcance e levam a avaliação para onde o talento está.",
    citacao: "O talento não escolhe CEP.",
    img: imgExpansao,
    alt: "Disputa de bola em partida noturna com estádio lotado",
  },
  {
    ano: "Presente",
    titulo: "Pelé Scout",
    texto:
      "A avaliação vira dado: olheiros registram desempenho, o atleta acompanha sua evolução e clubes encontram quem procuram.",
    citacao: "A avaliação virou dado.",
    img: imgCamisa,
    alt: "Camisa oficial do time com a bola de jogo",
  },
  {
    ano: "Hoje",
    titulo: "Na prática",
    texto:
      "Cada treino registrado é um passo a mais no perfil do atleta — visível para olheiros e clubes em todo o país.",
    citacao: "O próximo capítulo já começou.",
    img: imgLegadoHoje,
    alt: "Atleta em treino, retrato atual da academia",
  },
];

const LEGADO_ITEMS: StoryItem[] = MARCOS.map((m) => ({
  img: m.img,
  alt: m.alt,
  kicker: m.ano,
  titulo: m.titulo,
  texto: m.texto,
  destaque: m.citacao,
}));

export function Historia() {
  return (
    <section id="legado" className="border-y border-border bg-bg2/40 scroll-mt-24">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal className="max-w-2xl">
          <Eyebrow>Legado</Eyebrow>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-[3.25rem]">
            Existe história por trás desta oportunidade.
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <StoryCarousel
            items={LEGADO_ITEMS}
            nav="timeline"
            imageSide="left"
            label="Linha do tempo do legado"
          />
        </Reveal>
      </div>
    </section>
  );
}
