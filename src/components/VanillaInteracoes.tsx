import { useVanilla } from "@/hooks/use-vanilla";
import { montarInteracoesPerfil } from "@/assets/js/perfil.js";
import { montarSeguirFavoritar } from "@/assets/js/interacoes.js";

/**
 * Bloco "Interações da comunidade" do perfil do atleta.
 * O conteúdo (voto, seguir, favoritar, abas e tags) é criado por src/assets/js/perfil.js.
 */
export function InteracoesAtleta({
  atleta,
}: {
  atleta: { id: string; nome: string; posicao: string | null };
}) {
  const ref = useVanilla<HTMLElement>(
    (elemento) => montarInteracoesPerfil(elemento, atleta),
    [atleta.id, atleta.nome, atleta.posicao],
  );

  return (
    <section
      ref={ref}
      aria-label="Interações da comunidade"
      className="rounded-2xl border border-border bg-card p-6 shadow-card"
    />
  );
}

/**
 * Botões Seguir + Favoritar do perfil público do olheiro.
 * Criados por src/assets/js/interacoes.js.
 */
export function SeguirOlheiro({ id, nome }: { id: string; nome: string }) {
  const ref = useVanilla<HTMLDivElement>(
    (elemento) => montarSeguirFavoritar(elemento, { id, nome }),
    [id, nome],
  );
  return <div ref={ref} className="min-h-10" />;
}
