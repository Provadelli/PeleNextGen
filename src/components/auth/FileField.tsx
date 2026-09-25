import { useEffect, useId, useMemo, useRef, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Upload de imagem com pré-visualização. O botão é rotulado pelo título do
 * campo e o erro é ligado por `aria-describedby`.
 */
export function FileField({
  label,
  previewAlt,
  name,
  file,
  onChange,
  error,
  accept = "image/jpeg,image/png,image/webp",
}: {
  label: string;
  /** Texto alternativo da pré-visualização (ex.: "Foto do RG, frente"). */
  previewAlt: string;
  name: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const id = `campo-${name}`;
  const errorId = error ? `${id}-erro` : undefined;

  // Cria a URL só quando o arquivo muda e a libera depois (evita vazamento).
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handle(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
  }

  return (
    <div className="space-y-1.5">
      <p id={labelId} className={cn("text-sm font-medium", error && "text-error")}>
        {label}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handle}
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />
      {file && previewUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img src={previewUrl} alt={previewAlt} className="h-32 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:bg-background active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remover imagem: ${label}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="truncate bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
            {file.name}
          </p>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-labelledby={labelId}
          aria-describedby={errorId}
          className={cn(
            "flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error
              ? "border-error bg-error/5 text-error"
              : "border-border bg-bg2/40 text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary",
          )}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium">Enviar imagem</span>
        </button>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
