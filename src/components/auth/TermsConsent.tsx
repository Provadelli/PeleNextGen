import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const linkClass =
  "rounded-sm font-semibold text-primary underline transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Aceite dos Termos de Uso e da Política de Privacidade, com erro inline. */
export function TermsConsent({
  checked,
  onCheckedChange,
  error,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border bg-primary/5 p-3 transition-colors",
          error ? "border-error" : "border-primary/30",
        )}
      >
        <Checkbox
          id="campo-termos"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "campo-termos-erro" : undefined}
          className="mt-0.5"
        />
        <Label
          htmlFor="campo-termos"
          className="text-sm font-normal leading-relaxed text-foreground"
        >
          Li e aceito os{" "}
          <Link to="/termos" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Política de Privacidade
          </Link>
          <span className="sr-only"> (abrem em nova aba)</span>.
        </Label>
      </div>
      {error && (
        <p id="campo-termos-erro" className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
