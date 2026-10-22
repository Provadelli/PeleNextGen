import type { ReactNode } from "react";

/** Seção do styleguide: <section> com heading h2 e âncora que respeita a barra fixa. */
export function DSSection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-16 space-y-6">
      <div className="space-y-2">
        <h2 id={`${id}-titulo`} className="font-display text-2xl font-bold">
          {title}
        </h2>
        {intro && <p className="max-w-2xl text-muted-foreground">{intro}</p>}
      </div>
      {children}
    </section>
  );
}
