import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryItem {
  img: string;
  alt: string;
  /** Etiqueta curta do slide: ano (Legado) ou tag (Academia). */
  kicker: string;
  titulo: string;
  texto: string;
  /** Frase de destaque em dourado, opcional. */
  destaque?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Carrossel de histórias da home (Legado e Academia), no padrão visual do site:
 * card dividido em imagem (fade cruzado + zoom lento) e conteúdo (entra com fade).
 *
 * O autoplay é dirigido pela própria barra de progresso: uma animação CSS com a
 * duração do slide; ao terminar (`animationend`) avança. Pausar = pausar a
 * animação — barra e troca ficam sempre sincronizadas. Pausa com mouse em cima,
 * com foco dentro e com a seção fora da tela; sem autoplay em reduced-motion.
 */
export function StoryCarousel({
  items,
  nav,
  imageSide = "left",
  autoPlayMs = 6000,
  label,
}: {
  items: StoryItem[];
  nav: "timeline" | "tabs";
  imageSide?: "left" | "right";
  autoPlayMs?: number;
  /** Nome acessível do carrossel (ex.: "Linha do tempo do legado"). */
  label: string;
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);

  const total = items.length;
  const go = (i: number) => setActive(((i % total) + total) % total);
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoplay = !reduced;
  const paused = hovered || focused || !inView;
  const painelId = useId();

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    // Nas abas, o foco acompanha a aba ativa (roving tabindex).
    const lista = e.currentTarget.closest('[role="tablist"]');
    const focarAtiva = () =>
      requestAnimationFrame(() =>
        lista?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus(),
      );
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      focarAtiva();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      focarAtiva();
    }
  }

  // Swipe no celular: arrastar mais de 50px troca o slide.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") dragX.current = e.clientX;
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragX.current == null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }

  const item = items[active];

  /** Barra do autoplay; ao completar, avança. `key` reinicia a cada slide. */
  const progress = (className?: string) =>
    autoplay ? (
      <span
        key={`p-${active}`}
        onAnimationEnd={next}
        className={cn("story-progress block h-full origin-left bg-primary", className)}
        style={{
          animationDuration: `${autoPlayMs}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    ) : null;

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Pausa só com foco de teclado — clicar numa aba com o mouse não trava o autoplay.
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div role="region" aria-roledescription="carrossel" aria-label={label}>
        {/* Navegação: linha do tempo (Legado) ou abas (Academia). */}
        {nav === "timeline" ? (
          <div className="relative mb-8 hidden sm:block">
            <div className="absolute left-0 right-0 top-[7px] h-px bg-border" />
            <div
              className="absolute left-0 top-[7px] h-px bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${(active / Math.max(1, total - 1)) * 100}%` }}
            />
            <ol className="relative flex justify-between">
              {items.map((it, i) => (
                <li
                  key={it.kicker}
                  className={cn(
                    i === 0 ? "text-left" : i === total - 1 ? "text-right" : "text-center",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => go(i)}
                    onKeyDown={onKeyDown}
                    aria-current={i === active ? "step" : undefined}
                    className="group/tl inline-flex flex-col items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <span
                      className={cn(
                        "h-[15px] w-[15px] rounded-full border-2 transition-all duration-500",
                        i <= active
                          ? "border-primary bg-primary shadow-[0_0_0_5px] shadow-primary/20"
                          : "border-border bg-background group-hover/tl:border-primary/70",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.22em] transition-colors duration-300",
                        i === active
                          ? "text-gold-ink"
                          : "text-muted-foreground group-hover/tl:text-foreground",
                      )}
                    >
                      {it.kicker}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="-mx-6 mb-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div role="tablist" aria-label={label} className="flex w-max gap-2">
              {items.map((it, i) => (
                <button
                  key={it.kicker}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls={painelId}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => go(i)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "relative h-10 overflow-hidden rounded-full border px-5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300",
                    i === active
                      ? "border-primary bg-primary/10 text-gold-ink"
                      : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:text-foreground",
                  )}
                >
                  <span className="relative">{it.kicker}</span>
                  {i === active && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20">
                      {progress()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (dragX.current = null)}
          className={cn(
            "group grid overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-colors duration-500 hover:border-primary/40 lg:grid-cols-[58fr_42fr]",
            imageSide === "right" && "lg:grid-cols-[42fr_58fr]",
          )}
        >
          {/* Imagens empilhadas: fade cruzado + zoom lento na ativa (Ken Burns). */}
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-auto lg:min-h-[520px]",
              imageSide === "right" && "lg:order-2",
            )}
          >
            {items.map((it, i) => (
              <img
                key={it.img + i}
                src={it.img}
                alt={i === active ? it.alt : ""}
                aria-hidden={i !== active}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover saturate-[0.9] transition-[opacity,transform] ease-out motion-reduce:transition-none",
                  i === active
                    ? "scale-100 opacity-100 [transition-duration:900ms,7000ms]"
                    : "scale-[1.08] opacity-0 [transition-duration:900ms,900ms]",
                )}
              />
            ))}
            <div
              className={cn(
                "absolute inset-0 from-ink/60 via-transparent to-transparent",
                imageSide === "right"
                  ? "bg-gradient-to-t lg:bg-gradient-to-r"
                  : "bg-gradient-to-t lg:bg-gradient-to-l",
              )}
            />
            <span className="absolute left-5 top-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-gold">
              {item.kicker}
            </span>
          </div>

          {/* Conteúdo do slide ativo. */}
          <div className="flex flex-col justify-between gap-8 p-7 sm:p-10 lg:p-12">
            <div
              key={active}
              id={painelId}
              role="tabpanel"
              aria-live={paused || !autoplay ? "polite" : "off"}
              aria-label={`${active + 1} de ${total}`}
              className="hero-anim-fade-up"
            >
              <p className="font-display text-sm font-bold tabular-nums tracking-[0.2em]">
                <span className="text-gold-ink">{pad(active + 1)}</span>
                <span className="text-muted-foreground"> / {pad(total)}</span>
              </p>
              <h3 className="mt-6 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] lg:text-4xl">
                {item.titulo}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{item.texto}</p>
              {item.destaque && (
                <p className="mt-7 border-l-2 border-primary pl-4 font-display text-lg font-bold leading-snug text-gold-ink">
                  {item.destaque}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[
                  { fn: prev, Icon: ChevronLeft, label: "Anterior" },
                  { fn: next, Icon: ChevronRight, label: "Próximo" },
                ].map(({ fn, Icon, label: l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={fn}
                    onKeyDown={onKeyDown}
                    aria-label={l}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-gold active:scale-95"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              {/* Barra de progresso geral (na linha do tempo; nas abas ela fica na aba ativa). */}
              {nav === "timeline" && (
                <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-border">
                  {progress()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Celular (linha do tempo): pontos compactos no lugar da trilha. */}
        {nav === "timeline" && (
          <div className="mt-5 flex justify-center gap-2 sm:hidden">
            {items.map((it, i) => (
              <button
                key={it.kicker}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para ${it.kicker}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === active ? "w-8 bg-primary" : "w-2 bg-border",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
