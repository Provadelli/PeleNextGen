import imgGrupo from "@/assets/home/time-grupo.jpg";
import imgAcao from "@/assets/home/time-acao.jpg";
import imgNoturno from "@/assets/home/time-noturno.jpg";
import imgCamisa from "@/assets/home/time-camisa.jpg";
import imgLegadoHoje from "@/assets/home/legado-hoje.jpg";
import { Eyebrow, Reveal } from "./Reveal";
import { CalendlyCarousel, type CarouselItem } from "@/components/ui/connected-carousel";

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
    img: imgAcao,
    alt: "Atleta disputando lance durante uma partida",
  },
  {
    ano: "Expansão",
    titulo: "Do bairro ao país",
    texto:
      "Peneiras em diferentes estados ampliam o alcance e levam a avaliação para onde o talento está.",
    citacao: "O talento não escolhe CEP.",
    img: imgNoturno,
    alt: "Partida noturna em estádio cheio",
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

const LEGADO_ITEMS: CarouselItem[] = MARCOS.map((m) => ({
  id: m.ano,
  stat: m.ano,
  quote: m.texto,
  author: m.titulo,
  role: m.citacao,
  defaultImage: m.img,
  selectedImage: m.img,
  alt: m.alt,
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
          <CalendlyCarousel items={LEGADO_ITEMS} autoPlayInterval={3500} pauseOnHover />
        </Reveal>
      </div>
    </section>
  );
}
