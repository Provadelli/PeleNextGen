import { useId } from "react";
import { cn } from "@/lib/utils";

/** Grupo de campos com título: `<section>` rotulada pelo próprio `<h2>`. */
export function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={className}>
      <h2 id={titleId} className="mb-4 font-display text-lg font-bold">
        {title}
      </h2>
      <div className={cn("grid gap-5 sm:grid-cols-2")}>{children}</div>
    </section>
  );
}
