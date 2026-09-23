import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Trecho do título; `gold` destaca a palavra em dourado com brilho no final. */
export interface TitlePart {
  text: string;
  gold?: boolean;
  /** Quebra de linha depois deste trecho. */
  br?: boolean;
}

interface Char {
  ch: string;
  i: number;
  gold: boolean;
}

const TYPE_MS = 45;
const PAUSE_MS = 350; // respiro depois de pontuação
const START_DELAY_MS = 250;
const LOADER_TIMEOUT_MS = 4000;

type LoaderWindow = Window & { __pngLoaderDone?: boolean };

/** Espera o PageLoader sair de cena (ou o limite de segurança) antes de começar. */
function onLoaderDone(cb: () => void): () => void {
  const w = window as LoaderWindow;
  if (w.__pngLoaderDone) {
    cb();
    return () => {};
  }
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    cb();
  };
  window.addEventListener("png-loader-done", fire, { once: true });
  const t = window.setTimeout(fire, LOADER_TIMEOUT_MS);
  return () => {
    window.removeEventListener("png-loader-done", fire);
    window.clearTimeout(t);
  };
}

/**
 * Título do Hero "digitado" letra a letra após a tela de carregamento.
 * - Cursor dourado piscando; brilho percorre a palavra dourada ao terminar.
 * - Passar o mouse levanta a letra (e as vizinhas, em onda); clicar digita de novo.
 * - Leitores de tela e SEO recebem o texto completo (sr-only); com
 *   prefers-reduced-motion o texto aparece inteiro, sem digitação.
 */
export function TypewriterTitle({ parts, className }: { parts: TitlePart[]; className?: string }) {
  // Palavras (para não quebrar linha no meio) com o índice global de cada letra.
  const { lines, total, fullText } = useMemo(() => {
    let i = 0;
    const lines: { words: Char[][] }[] = [{ words: [] }];
    for (const part of parts) {
      const tokens = part.text.split(/(\s+)/);
      for (const tok of tokens) {
        if (!tok) continue;
        const line = lines[lines.length - 1];
        if (/^\s+$/.test(tok)) {
          i += 1; // espaço conta como um "tique" da digitação
          line.words.push([]); // separador de palavra
          continue;
        }
        const word = [...tok].map((ch) => ({ ch, i: i++, gold: !!part.gold }));
        const last = line.words[line.words.length - 1];
        // Continua a palavra anterior quando o trecho seguinte gruda nela (ex.: "oportunidade" + ".").
        if (last && last.length > 0) last.push(...word);
        else line.words.push(word);
      }
      if (part.br) lines.push({ words: [] });
    }
    return {
      lines: lines.map((l) => ({ words: l.words.filter((w) => w.length > 0) })),
      total: i,
      fullText: parts.map((p) => p.text + (p.br ? " " : "")).join(""),
    };
  }, [parts]);

  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const flat = useMemo(() => lines.flatMap((l) => l.words.flat()), [lines]);

  const start = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setCount(0);
    setRunning(true);
    let n = 0;
    const tick = () => {
      n += 1;
      setCount(n);
      if (n >= total) {
        setRunning(false);
        return;
      }
      const prev = flat.find((c) => c.i === n - 1)?.ch ?? "";
      timer.current = window.setTimeout(tick, /[.,!?]/.test(prev) ? PAUSE_MS : TYPE_MS);
    };
    timer.current = window.setTimeout(tick, START_DELAY_MS);
  }, [total, flat]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(total);
      return;
    }
    const off = onLoaderDone(start);
    return () => {
      off();
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [start, total]);

  const done = count >= total;

  return (
    <h1 className={cn("tw-title", done && "tw-done", className)}>
      <span className="sr-only">{fullText}</span>
      <span
        aria-hidden="true"
        onClick={() => !running && start()}
        title="Clique para ver de novo"
        className="block cursor-default select-none"
      >
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.words.map((word, wi) => (
              <span key={wi}>
                {wi > 0 && " "}
                <span className="inline-block whitespace-nowrap">
                  {word.map((c) => {
                    const typed = c.i < count;
                    return (
                      <span key={c.i} className="tw-cell relative inline-block">
                        <span
                          style={{ ["--i" as string]: c.i }}
                          className={cn(
                            "tw-char inline-block",
                            typed ? "tw-typed" : "opacity-0",
                            c.gold && "tw-gold text-primary",
                          )}
                        >
                          {c.ch}
                        </span>
                        {/* Cursor logo após a última letra digitada (largura zero: não mexe no layout). */}
                        {c.i === count - 1 && (
                          <span className={cn("tw-caret", done && "tw-caret-out")} />
                        )}
                      </span>
                    );
                  })}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}
