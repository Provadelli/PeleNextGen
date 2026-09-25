import { useId, type ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Props de acessibilidade que o FormField entrega ao controle filho. */
export type FieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

/**
 * Campo de formulário acessível: liga `<label>` ao controle (htmlFor/id),
 * e a mensagem de erro/dica via `aria-describedby`, marcando `aria-invalid`.
 *
 * Com `icon`, o controle recebe `pl-10` automaticamente via `className` do wrapper.
 */
export function FormField({
  label,
  error,
  hint,
  icon: Icon,
  name,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  /** Usado como id do controle (útil para focar o primeiro erro). */
  name?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactElement;
}) {
  const autoId = useId();
  const id = name ? `campo-${name}` : autoId;
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const control = children({
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  });

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className={cn("text-sm font-semibold", error && "text-error")}>
        {label}
      </Label>
      {Icon ? (
        <div className="relative [&_input]:pl-10">
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          {control}
        </div>
      ) : (
        control
      )}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
