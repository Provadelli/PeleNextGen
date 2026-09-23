import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/pele-next-gen-mark.png";

export interface ShowcaseItem {
  img: string;
  alt: string;
  tag: string;
  titulo: string;
  texto: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const EASE = [0.16, 1, 0.3, 1] as const;

function usePrefersReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Cursor com a marca "10" da Pelé Next Gen. Segue o ponteiro com mola e só aparece
 * sobre áreas marcadas com `data-logo-cursor` (títulos e textos da seção). Cresce
 * sobre itens clicáveis e "pulsa" no clique. Só em ponteiro fino e sem reduced-motion.
 */
function LogoCursor({ areaRef }: { areaRef: RefObject<HTMLElement | null> }) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 38, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 38, mass: 0.5 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const [overButton, setOverButton] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    if (!enabled || !area) return;
    area.classList.add("logo-cursor-on");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element;
      const inside = !!target.closest?.("[data-logo-cursor]");
      if (inside && !visibleRef.current) {
        // Primeira entrada: posiciona sem a mola "voar" desde o canto da tela.
        sx.jump(e.clientX);
        sy.jump(e.clientY);
      }
      x.set(e.clientX);
      y.set(e.clientY);
      visibleRef.current = inside;
      setVisible(inside);
      setOverButton(inside && !!target.closest?.("button, a"));
    };
    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onScroll = onLeave;

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    area.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      area.classList.remove("logo-cursor-on");
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      area.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, areaRef, x, y, sx, sy]);

  if (!enabled) return null;

  // Portal no body: ancestrais com transform/filter (Reveal) quebrariam o `fixed`.
  return createPortal(
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="-ml-7 -mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-primary/70 bg-white/90 shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--gold)_65%,transparent)] backdrop-blur-md"
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          scale: !visible ? 0.3 : pressed ? 0.82 : overButton ? 1.25 : 1,
          rotate: overButton ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
      >
        <img src={logoMark} alt="" className="h-8 w-8 object-contain" draggable={false} />
        {/* Anel dourado que se expande a cada clique. */}
        <AnimatePresence>
          {pressed && (
            <motion.span
              key="pulse"
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/** Texto que entra palavra por palavra (fade + blur + leve subida). */
function WordsIn({ text, delay = 0, reduced }: { text: string; delay?: number; reduced: boolean }) {
  if (reduced) return <>{text}</>;
  return (
    <>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.5em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: delay + i * 0.028, ease: EASE }}
        >
          {w + " "}
        </motion.span>
      ))}
    </>
  );
}

/**
 * Vitrine da Academia: títulos na vertical à esquerda; foto e texto à direita.
 * Autoplay dirigido pela barra de progresso do título ativo (animação CSS →
 * `animationend` avança), pausa com o mouse em cima / foco / fora da tela.
 * Passar o mouse num título troca o slide; clicar fixa a escolha e reinicia o tempo.
 */
export function AcademiaShowcase({
  items,
  label,
  autoPlayMs = 6500,
}: {
  items: ShowcaseItem[];
  label: string;
  autoPlayMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [cycle, setCycle] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReduced();
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const dragX = useRef<number | null>(null);

  const total = items.length;
  const item = items[active];
  const paused = hovered || focused || !inView;

  // Ref para o hover com atraso não usar um `active` desatualizado.
  const activeRef = useRef(active);
  activeRef.current = active;

  function go(i: number, direction?: number) {
    const nextIndex = ((i % total) + total) % total;
    const current = activeRef.current;
    if (nextIndex === current) return;
    setDir(direction ?? (nextIndex > current ? 1 : -1));
    setActive(nextIndex);
  }
  const next = () => go(active + 1, 1);
  const prev = () => go(active - 1, -1);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    },
    [],
  );

  // Pré-carrega as fotos para a troca não "piscar".
  useEffect(() => {
    items.forEach((it) => {
      const img = new Image();
      img.src = it.img;
    });
  }, [items]);

  function hoverTitle(i: number) {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => go(i), 140);
  }
  function clickTitle(i: number) {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    go(i);
    setCycle((c) => c + 1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") dragX.current = e.clientX;
  }
  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragX.current == null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }

  const progress = (axis: "x" | "y") =>
    reduced ? null : (
      <span
        key={`p-${active}-${cycle}`}
        onAnimationEnd={next}
        className={cn(
          "block h-full w-full bg-gradient-to-b from-gold-light via-primary to-gold-dark",
          axis === "y" ? "story-progress-y origin-top" : "story-progress origin-left",
        )}
        style={{
          animationDuration: `${autoPlayMs}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    );

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      }}
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      className="relative"
    >
      <LogoCursor areaRef={rootRef} />

      {/* Celular: faixa de abas roláveis com progresso na aba ativa. */}
      <div className="-mx-6 mb-6 overflow-x-auto px-6 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label={label} className="flex w-max gap-2">
          {items.map((it, i) => (
            <button
              key={it.tag}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => clickTitle(i)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative h-10 overflow-hidden rounded-full border px-5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300",
                i === active
                  ? "border-primary bg-primary text-primary-foreground shadow-gold"
                  : "border-foreground/15 text-foreground/60",
              )}
            >
              {it.tag}
              {i === active && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/30">
                  {progress("x")}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* Títulos (desktop): lista vertical com indicador deslizante. */}
        <ol
          role="tablist"
          aria-orientation="vertical"
          aria-label={label}
          data-logo-cursor
          className="relative hidden flex-col justify-center lg:flex"
        >
          {items.map((it, i) => {
            const on = i === active;
            return (
              <li key={it.tag} className="relative">
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onMouseEnter={() => hoverTitle(i)}
                  onClick={() => clickTitle(i)}
                  onKeyDown={onKeyDown}
                  className="group/t relative flex w-full items-start gap-5 rounded-2xl py-5 pl-7 pr-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {on && (
                    <motion.span
                      layoutId="academia-active-bg"
                      className="absolute inset-0 rounded-2xl border border-primary/25 bg-white shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--gold)_70%,transparent)]"
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    />
                  )}
                  {/* Trilho vertical: progresso do autoplay no item ativo. */}
                  <span className="absolute bottom-4 left-0 top-4 w-[3px] overflow-hidden rounded-full bg-foreground/10">
                    {on && progress("y")}
                  </span>

                  <span
                    className={cn(
                      "relative mt-1 font-display text-sm font-bold tabular-nums tracking-[0.18em] transition-colors duration-500",
                      on ? "text-primary" : "text-foreground/30 group-hover/t:text-primary/70",
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="relative">
                    <span
                      className={cn(
                        "block text-[10px] font-bold uppercase tracking-[0.28em] transition-colors duration-500",
                        on ? "text-primary" : "text-foreground/40",
                      )}
                    >
                      {it.tag}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block font-display text-2xl font-extrabold leading-[1.1] tracking-[-0.02em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] xl:text-[1.75rem]",
                        on
                          ? "translate-x-1 text-foreground"
                          : "text-foreground/35 group-hover/t:translate-x-1 group-hover/t:text-foreground/70",
                      )}
                    >
                      {it.titulo}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Foto + texto. */}
        <div className="relative">
          <div
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragX.current = null)}
            className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] ring-1 ring-primary/30 sm:aspect-[16/10] lg:aspect-auto lg:h-[560px]"
          >
            <AnimatePresence initial={false} custom={dir}>
              <motion.img
                key={active}
                src={item.img}
                alt={item.alt}
                custom={dir}
                variants={{
                  enter: (d: number) => ({
                    clipPath: d > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
                    scale: 1.18,
                    zIndex: 2,
                  }),
                  center: { clipPath: "inset(0 0 0 0%)", scale: 1.04, zIndex: 2 },
                  exit: (d: number) => ({
                    x: d > 0 ? "-12%" : "12%",
                    scale: 1,
                    opacity: 0.4,
                    zIndex: 1,
                  }),
                }}
                initial={reduced ? false : "enter"}
                animate="center"
                exit={reduced ? { opacity: 0 } : "exit"}
                transition={{
                  clipPath: { duration: 1.05, ease: [0.77, 0, 0.18, 1] },
                  scale: { duration: 1.6, ease: EASE },
                  x: { duration: 1.05, ease: [0.77, 0, 0.18, 1] },
                  opacity: { duration: 1.05 },
                }}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            {/* Brilho dourado corrido a cada troca. */}
            {!reduced && (
              <motion.div
                key={`shine-${active}`}
                className="pointer-events-none absolute inset-y-0 z-[4] w-1/3 bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--gold-light)_35%,transparent)] to-transparent"
                initial={{ left: "-40%", opacity: 0 }}
                animate={{ left: "120%", opacity: [0, 1, 0] }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
              />
            )}

            {/* Topo da foto: tag e controles manuais. */}
            <div className="absolute inset-x-0 top-0 z-[5] flex items-start justify-between p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.span
                  key={item.tag}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-full bg-gradient-gold px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-foreground shadow-gold"
                >
                  {item.tag}
                </motion.span>
              </AnimatePresence>
              <div className="flex gap-2">
                {[
                  { fn: prev, Icon: ArrowLeft, l: "Anterior" },
                  { fn: next, Icon: ArrowRight, l: "Próximo" },
                ].map(({ fn, Icon, l }) => (
                  <button
                    key={l}
                    type="button"
                    aria-label={l}
                    onClick={() => {
                      fn();
                      setCycle((c) => c + 1);
                    }}
                    onKeyDown={onKeyDown}
                    className="group/a flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-ink/35 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-gold active:scale-95"
                  >
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover/a:scale-110" />
                  </button>
                ))}
              </div>
            </div>

            {/* Contador grande no canto. */}
            <div className="pointer-events-none absolute bottom-4 right-6 z-[5] hidden font-display text-[5.5rem] font-extrabold leading-none tracking-[-0.06em] text-white/15 sm:block lg:bottom-[11.5rem]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  className="block"
                  initial={{ y: "40%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-40%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {pad(active + 1)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Texto do slide: painel branco sobreposto à base da foto. */}
          <div
            data-logo-cursor
            aria-live={paused || reduced ? "polite" : "off"}
            className="relative z-10 mx-3 -mt-14 rounded-3xl border border-primary/20 bg-white p-6 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.45)] sm:mx-8 sm:p-8 lg:absolute lg:inset-x-8 lg:bottom-6 lg:mx-0 lg:mt-0"
          >
            <span className="absolute left-8 top-0 h-[3px] w-16 -translate-y-1/2 rounded-full bg-gradient-gold" />
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-2xl lg:hidden">
                <WordsIn key={`t-${active}`} text={item.titulo} reduced={reduced} />
              </h3>
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-primary lg:block">
                {item.tag}
              </p>
              <p className="shrink-0 font-display text-xs font-bold tabular-nums tracking-[0.2em]">
                <span className="text-primary">{pad(active + 1)}</span>
                <span className="text-ink/40"> / {pad(total)}</span>
              </p>
            </div>
            <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-ink/70 sm:text-[15px]">
              <WordsIn key={`x-${active}`} text={item.texto} delay={0.15} reduced={reduced} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
