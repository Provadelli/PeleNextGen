/**
 * store.js — Guarda as ações do usuário (votos, tags confirmadas, quem ele segue e favoritos).
 *
 * Usa o localStorage para que o estado continue igual entre o feed, o perfil do atleta
 * e o perfil do olheiro. No servidor (SSR) ou com o armazenamento bloqueado,
 * o estado fica só na memória, sem gerar erro no console.
 */

const STORAGE_KEY = "pele-next-gen:interacoes";

/** Cada lista guarda ids (ou "idAtleta:idTag" no caso das tags). */
function estadoVazio() {
  return { votos: [], tags: [], seguindo: [], favoritos: [] };
}

let estado = null;

/** Carrega o estado na primeira vez que for usado (nunca durante o import). */
function obterEstado() {
  if (estado) return estado;
  estado = estadoVazio();
  try {
    const salvo = window.localStorage.getItem(STORAGE_KEY);
    if (salvo) estado = { ...estado, ...JSON.parse(salvo) };
  } catch {
    // Sem window/localStorage: segue com o estado em memória.
  }
  return estado;
}

function salvar() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obterEstado()));
  } catch {
    // Armazenamento indisponível: mantém apenas em memória.
  }
}

/**
 * Verifica se um valor está em uma lista.
 * @param {"votos"|"tags"|"seguindo"|"favoritos"} lista
 * @param {string} valor
 */
export function tem(lista, valor) {
  return obterEstado()[lista].includes(valor);
}

/**
 * Liga/desliga um valor em uma lista e salva.
 * @param {"votos"|"tags"|"seguindo"|"favoritos"} lista
 * @param {string} valor
 * @returns {boolean} true se ficou ativo, false se foi removido
 */
export function alternar(lista, valor) {
  const atual = obterEstado();
  const ativo = atual[lista].includes(valor);
  atual[lista] = ativo ? atual[lista].filter((item) => item !== valor) : [...atual[lista], valor];
  salvar();
  return !ativo;
}
