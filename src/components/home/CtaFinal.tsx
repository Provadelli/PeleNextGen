import { GoldButton } from "./GoldButton";
import campo from "@/assets/home/time-acao.jpg";
import { Reveal } from "./Reveal";

export function CtaFinal() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border">
      <img
        src={campo}
        alt="Atleta disputando lance durante uma partida"
        loading="lazy"
        width={1808}
        height={912}
        className="absolute inset-0 -z-10 h-full w-full object-cover saturate-[0.7]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,oklch(0.12_0.02_75/0.97)_0%,oklch(0.16_0.03_80/0.92)_45%,oklch(0.20_0.03_75/0.65)_100%)]" />

      <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-10 lg:py-40">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-gold-light">
            <span className="h-px w-10 bg-gold-light/60" />
            Pelé Scout
          </p>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] text-slate-50 lg:text-6xl">
            Seu próximo capítulo começa aqui.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-200">
            Uma peneira pode mudar o rumo de uma carreira. Crie seu perfil, seja avaliado e mostre o
            que você já treina há anos.
          </p>
          <div className="mt-10">
            <GoldButton href="/cadastro">Encontrar minha peneira</GoldButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
