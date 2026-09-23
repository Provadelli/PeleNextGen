import campo from "@/assets/home/campo-peneira.jpeg";
import chuteira from "@/assets/home/chuteira-peneira.jpeg";
import estadio from "@/assets/home/estadio-peneiras.jpeg";

/** Capas oficiais das peneiras — revezadas para dar variedade visual às listas. */
export const PENEIRA_COVERS = [campo, chuteira, estadio] as const;

/** Capa pela posição do card: cards vizinhos nunca repetem a mesma imagem. */
export function coverByIndex(index: number): string {
  return PENEIRA_COVERS[((index % PENEIRA_COVERS.length) + PENEIRA_COVERS.length) % PENEIRA_COVERS.length];
}

/** Capa estável a partir do id (para cards fora de uma lista ordenada). */
export function coverById(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return coverByIndex(Math.abs(h));
}
