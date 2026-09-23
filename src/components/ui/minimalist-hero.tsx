import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import defaultFallback from "@/assets/home/hero-atleta.jpg";

/*
 * MinimalistHero (21st.dev) adaptado ao projeto.
 * O original usa framer-motion, mas as animações de entrada do `motion.*` não
 * disparam após a hidratação SSR do TanStack Start neste projeto. O mesmo efeito
 * (mesmas curvas e atrasos) foi portado para keyframes CSS em src/styles.css
 * (.hero-anim-*), que rodam no primeiro paint e respeitam prefers-reduced-motion.
 */

/** Atraso de entrada, em segundos, aplicado a um bloco animado. */
const delay = (s: number): React.CSSProperties => ({ animationDelay: `${s}s` });

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  readMoreLabel?: string;
  imageSrc: string;
  imageAlt: string;
  fallbackSrc?: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  socialLinks: { icon: LucideIcon; href: string; label?: string }[];
  locationText: string;
  className?: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

export const SocialIcon = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-foreground/60 transition-colors hover:text-foreground"
  >
    <Icon className="h-5 w-5" />
  </a>
);

const CIRCLE_SIZES = {
  sm: "h-32 w-32",
  md: "h-[260px] w-[260px] xl:h-[340px] xl:w-[340px]",
  lg: "h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]",
} as const;

const IMAGE_SIZES = {
  sm: "h-24 w-24",
  md: "h-[210px] w-[210px] xl:h-[280px] xl:w-[280px]",
  lg: "w-56 md:w-64 lg:w-72 scale-150",
} as const;

/**
 * Núcleo do efeito: círculo dourado que cresce + imagem que sobe por cima.
 * `rounded` recorta a imagem em círculo (fotos comuns, sem fundo transparente).
 */
export function HeroCircleImage({
  src,
  alt,
  size = "lg",
  rounded = false,
  fallbackSrc = defaultFallback,
  className,
}: {
  src: string;
  alt: string;
  size?: keyof typeof CIRCLE_SIZES;
  rounded?: boolean;
  fallbackSrc?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center", className)}>
      <div
        className={cn(
          "hero-anim-circle absolute z-0 rounded-full bg-primary/90",
          CIRCLE_SIZES[size],
        )}
      />
      {/* Nova foto = nova montagem (key) = a animação de subida roda de novo. */}
      <img
        key={src}
        src={src}
        alt={alt}
        className={cn(
          "hero-anim-rise relative z-10 h-auto object-cover",
          IMAGE_SIZES[size],
          rounded && "rounded-full border-4 border-background shadow-2xl",
        )}
        onError={(e) => {
          const target = e.currentTarget;
          target.onerror = null;
          target.src = fallbackSrc;
        }}
      />
    </div>
  );
}

/** Texto gigante que entra depois da imagem. */
export function HeroOverlayText({
  part1,
  part2,
  delay: d = 1.2,
  className,
}: {
  part1: React.ReactNode;
  part2: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <h1
      style={delay(d)}
      className={cn(
        "hero-anim-fade-up font-display text-7xl font-extrabold leading-[0.95] text-foreground md:text-8xl lg:text-9xl",
        className,
      )}
    >
      {part1}
      <br />
      {part2}
    </h1>
  );
}

/** Bloco que aparece com fade (de baixo ou da esquerda) após `delay` segundos. */
export function HeroFade({
  from = "up",
  delay: d = 0,
  className,
  children,
}: {
  from?: "up" | "left";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={delay(d)}
      className={cn(from === "up" ? "hero-anim-fade-up" : "hero-anim-fade-right", className)}
    >
      {children}
    </div>
  );
}

export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  readMoreLabel = "Saiba mais",
  imageSrc,
  imageAlt,
  fallbackSrc,
  overlayText,
  socialLinks,
  locationText,
  className,
}: MinimalistHeroProps) => {
  return (
    <div
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background p-8 font-sans md:p-12",
        className,
      )}
    >
      <header className="z-30 flex w-full max-w-7xl items-center justify-between">
        <HeroFade from="left" className="text-xl font-bold tracking-wider">
          {logoText}
        </HeroFade>
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <button className="flex flex-col space-y-1.5 md:hidden" aria-label="Abrir menu">
          <span className="block h-0.5 w-6 bg-foreground"></span>
          <span className="block h-0.5 w-6 bg-foreground"></span>
          <span className="block h-0.5 w-5 bg-foreground"></span>
        </button>
      </header>

      <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center md:grid-cols-3">
        <HeroFade delay={1} className="z-20 order-2 text-center md:order-1 md:text-left">
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-foreground/80 md:mx-0">
            {mainText}
          </p>
          <a
            href={readMoreLink}
            className="mt-4 inline-block text-sm font-medium text-foreground underline decoration-from-font"
          >
            {readMoreLabel}
          </a>
        </HeroFade>

        <HeroCircleImage
          src={imageSrc}
          alt={imageAlt}
          fallbackSrc={fallbackSrc}
          className="order-1 h-full md:order-2"
        />

        <div className="z-20 order-3 flex items-center justify-center text-center md:justify-start">
          <HeroOverlayText part1={overlayText.part1} part2={overlayText.part2} />
        </div>
      </div>

      <footer className="z-30 flex w-full max-w-7xl items-center justify-between">
        <HeroFade delay={1.2} className="flex items-center space-x-4">
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} label={link.label} />
          ))}
        </HeroFade>
        <HeroFade delay={1.3} className="text-sm font-medium text-foreground/80">
          {locationText}
        </HeroFade>
      </footer>
    </div>
  );
};
