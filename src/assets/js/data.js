/**
 * data.js — Dados de apoio das interações em JavaScript nativo:
 * região de cada estado, atributos sugeridos por posição e helpers de texto.
 * Os atletas em si vêm do Supabase (a página React busca e entrega para o feed.js).
 */

/** Posições usadas nos filtros (as mesmas do cadastro e do ranking). */
export const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

/** Regiões geográficas do Brasil, na ordem do filtro. */
export const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

/** Região de cada UF e nome do estado (para achar a UF quando a cidade vem escrita por extenso). */
const ESTADOS = {
  AC: ["Acre", "Norte"],
  AL: ["Alagoas", "Nordeste"],
  AM: ["Amazonas", "Norte"],
  AP: ["Amapá", "Norte"],
  BA: ["Bahia", "Nordeste"],
  CE: ["Ceará", "Nordeste"],
  DF: ["Distrito Federal", "Centro-Oeste"],
  ES: ["Espírito Santo", "Sudeste"],
  GO: ["Goiás", "Centro-Oeste"],
  MA: ["Maranhão", "Nordeste"],
  MG: ["Minas Gerais", "Sudeste"],
  MS: ["Mato Grosso do Sul", "Centro-Oeste"],
  MT: ["Mato Grosso", "Centro-Oeste"],
  PA: ["Pará", "Norte"],
  PB: ["Paraíba", "Nordeste"],
  PE: ["Pernambuco", "Nordeste"],
  PI: ["Piauí", "Nordeste"],
  PR: ["Paraná", "Sul"],
  RJ: ["Rio de Janeiro", "Sudeste"],
  RN: ["Rio Grande do Norte", "Nordeste"],
  RO: ["Rondônia", "Norte"],
  RR: ["Roraima", "Norte"],
  RS: ["Rio Grande do Sul", "Sul"],
  SC: ["Santa Catarina", "Sul"],
  SE: ["Sergipe", "Nordeste"],
  SP: ["São Paulo", "Sudeste"],
  TO: ["Tocantins", "Norte"],
};

/** Atributos que olheiros podem confirmar, de acordo com a posição do atleta. */
const ATRIBUTOS_POR_POSICAO = {
  Goleiro: ["Reflexo", "Posicionamento", "Reposição"],
  Zagueiro: ["Marcação", "Força", "Cabeceio"],
  Lateral: ["Velocidade", "Cruzamento", "Marcação"],
  Volante: ["Marcação", "Passe", "Posicionamento"],
  Meia: ["Passe", "Visão de jogo", "Drible"],
  Atacante: ["Finalização", "Velocidade", "Drible"],
};
const ATRIBUTOS_PADRAO = ["Passe", "Velocidade", "Força"];

/** Remove acentos e deixa minúsculo ("São Paulo" → "sao paulo"). */
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Descobre a UF a partir do texto da cidade.
 * Aceita "Nova Iguaçu - RJ", "Recife, PE", "Curitiba/PR" ou "Belo Horizonte, Minas Gerais".
 * @param {string|null} cidade
 * @returns {string|null}
 */
export function ufDaCidade(cidade) {
  if (!cidade) return null;
  const sigla = cidade.trim().match(/(?:^|[\s,/(-])([A-Za-z]{2})\)?$/);
  if (sigla && ESTADOS[sigla[1].toUpperCase()]) return sigla[1].toUpperCase();

  const texto = normalizar(cidade);
  // Procura primeiro os nomes mais longos ("Mato Grosso do Sul" antes de "Mato Grosso").
  const porNome = Object.entries(ESTADOS)
    .sort((a, b) => b[1][0].length - a[1][0].length)
    .find(([, [nome]]) => texto.includes(normalizar(nome)));
  return porNome ? porNome[0] : null;
}

/** Região geográfica a partir da cidade, ou null se não der para descobrir. */
export function regiaoDaCidade(cidade) {
  const uf = ufDaCidade(cidade);
  return uf ? ESTADOS[uf][1] : null;
}

/** Lista de atributos confirmáveis para a posição. */
export function atributosDaPosicao(posicao) {
  return ATRIBUTOS_POR_POSICAO[posicao] ?? ATRIBUTOS_PADRAO;
}

/** Id estável para um atributo ("Visão de jogo" → "visao-de-jogo"). */
export function idDoAtributo(label) {
  return normalizar(label).replace(/\s+/g, "-");
}

/** Iniciais para o avatar ("Gabriel Souza" → "GS"). */
export function iniciais(nome) {
  const partes = String(nome ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}
