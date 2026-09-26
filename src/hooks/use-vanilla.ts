import { useCallback, useRef, type DependencyList } from "react";

/**
 * Ponte entre o React e os módulos em JavaScript nativo de src/assets/js/.
 *
 * Devolve um "callback ref": quando o elemento aparece na tela (mesmo que só depois
 * de uma etapa, como no login), `montar` recebe o elemento e cria o conteúdo com o DOM.
 * A função de limpeza que `montar` devolve roda quando o elemento sai da tela
 * ou quando as dependências mudam, removendo listeners e conteúdo.
 */
export function useVanilla<T extends HTMLElement>(
  montar: (elemento: T) => (() => void) | void,
  deps: DependencyList,
) {
  const limpar = useRef<(() => void) | null>(null);

  return useCallback(
    (elemento: T | null) => {
      limpar.current?.();
      limpar.current = null;
      if (elemento) limpar.current = montar(elemento) ?? null;
    },
    // `montar` é recriada a cada render; quem controla a remontagem são as deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );
}
