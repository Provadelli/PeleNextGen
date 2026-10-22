import type { ComponentType, ReactNode } from "react";

/** Estado vazio padrão: ícone, título, descrição e ação opcional dentro de uma caixa tracejada. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
