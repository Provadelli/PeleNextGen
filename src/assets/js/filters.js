/**
 * filters.js — Filtros em tempo real do feed, sem recarregar a página:
 *  - posição (chips com aria-pressed, evento click);
 *  - região geográfica (select, evento change);
 *  - busca por nome ou cidade (input, evento input — filtra a cada letra).
 *
 * Os cards não são recriados: o feed.js só alterna a classe "hidden" em cada um,
 * usando passa(card) para decidir.
 */
import { criar, FOCO } from "./ui.js";
import { POSICOES, REGIOES, normalizar } from "./data.js";

const CLASSE_CAMPO =
  "h-10 w-full rounded-lg border border-border bg-bg3 px-3 text-sm text-foreground placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Cria o painel de filtros.
 * @param {{ aoFiltrar: () => void }} opcoes
 */
export function criarFiltros({ aoFiltrar }) {
  const criterios = { posicao: "Todas", regiao: "Todas", busca: "" };

  const painel = criar("section", {
    className: "grid gap-4 rounded-2xl border border-border bg-bg2 p-4",
    attrs: { "aria-label": "Filtros do feed" },
  });

  /* ---------- Chips de posição ---------- */
  const grupo = criar("fieldset", { className: "flex flex-wrap gap-2" });
  grupo.appendChild(
    criar("legend", {
      className: "mb-2 w-full text-xs font-semibold text-muted-foreground",
      text: "Posição",
    }),
  );
  ["Todas", ...POSICOES].forEach((posicao) => {
    grupo.appendChild(
      criar("button", {
        className: `min-h-9 rounded-full border border-border bg-bg3 px-3 text-sm font-medium transition-colors hover:border-primary/50 active:scale-95 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground ${FOCO}`,
        text: posicao,
        attrs: {
          type: "button",
          "data-posicao": posicao,
          "aria-pressed": String(posicao === "Todas"),
        },
      }),
    );
  });

  /* ---------- Busca, região e limpar ---------- */
  const linha = criar("div", { className: "grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end" });

  const campoBusca = criar("input", {
    className: CLASSE_CAMPO,
    attrs: {
      id: "feed-busca",
      type: "search",
      placeholder: "Ex.: Gabriel ou Recife",
      autocomplete: "off",
    },
  });
  const blocoBusca = criar("div", { className: "grid gap-1" });
  blocoBusca.append(
    criar("label", {
      className: "text-xs font-semibold text-muted-foreground",
      text: "Buscar por nome ou cidade",
      attrs: { for: "feed-busca" },
    }),
    campoBusca,
  );

  const selectRegiao = criar("select", { className: CLASSE_CAMPO, attrs: { id: "feed-regiao" } });
  selectRegiao.appendChild(
    criar("option", { text: "Todas as regiões", attrs: { value: "Todas" } }),
  );
  REGIOES.forEach((regiao) =>
    selectRegiao.appendChild(criar("option", { text: regiao, attrs: { value: regiao } })),
  );
  const blocoRegiao = criar("div", { className: "grid gap-1" });
  blocoRegiao.append(
    criar("label", {
      className: "text-xs font-semibold text-muted-foreground",
      text: "Região",
      attrs: { for: "feed-regiao" },
    }),
    selectRegiao,
  );

  const botaoLimpar = criar("button", {
    className: `h-10 rounded-lg border border-border bg-bg3 px-4 text-sm font-semibold transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${FOCO}`,
    text: "Limpar filtros",
    attrs: { type: "button" },
  });

  linha.append(blocoBusca, blocoRegiao, botaoLimpar);

  /* ---------- Contagem (lida por leitores de tela) ---------- */
  const contagem = criar("p", {
    className: "text-sm text-muted-foreground",
    attrs: { role: "status", "aria-live": "polite" },
  });

  painel.append(grupo, linha, contagem);

  /** Desabilita "Limpar filtros" quando não há nada para limpar. */
  const atualizarBotaoLimpar = () => {
    botaoLimpar.disabled =
      criterios.posicao === "Todas" && criterios.regiao === "Todas" && !criterios.busca;
  };

  const mudou = () => {
    atualizarBotaoLimpar();
    aoFiltrar();
  };

  /* ---------- Eventos ---------- */
  grupo.addEventListener("click", (evento) => {
    const chip = evento.target.closest("[data-posicao]");
    if (!chip) return;
    criterios.posicao = chip.dataset.posicao;
    grupo
      .querySelectorAll("[data-posicao]")
      .forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    mudou();
  });

  selectRegiao.addEventListener("change", () => {
    criterios.regiao = selectRegiao.value;
    mudou();
  });

  campoBusca.addEventListener("input", () => {
    criterios.busca = normalizar(campoBusca.value);
    mudou();
  });

  const limpar = () => {
    criterios.posicao = "Todas";
    criterios.regiao = "Todas";
    criterios.busca = "";
    campoBusca.value = "";
    selectRegiao.value = "Todas";
    grupo
      .querySelectorAll("[data-posicao]")
      .forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.posicao === "Todas")));
    mudou();
  };
  botaoLimpar.addEventListener("click", limpar);
  atualizarBotaoLimpar();

  return {
    elemento: painel,
    limpar,

    /** Card passa nos filtros? Os dados ficam em data-posicao, data-regiao e data-busca. */
    passa(card) {
      const { posicao, regiao, busca } = card.dataset;
      if (criterios.posicao !== "Todas" && posicao !== criterios.posicao) return false;
      if (criterios.regiao !== "Todas" && regiao !== criterios.regiao) return false;
      if (criterios.busca && !normalizar(busca).includes(criterios.busca)) return false;
      return true;
    },

    /** Atualiza o texto "5 atletas encontrados com Meia, região Sudeste". */
    mostrarContagem(total) {
      const partes = [];
      if (criterios.posicao !== "Todas") partes.push(criterios.posicao);
      if (criterios.regiao !== "Todas") partes.push(`região ${criterios.regiao}`);
      if (criterios.busca) partes.push(`busca "${campoBusca.value.trim()}"`);
      const sufixo = partes.length ? ` com ${partes.join(", ")}` : "";
      contagem.textContent = `${total} ${total === 1 ? "atleta encontrado" : "atletas encontrados"}${sufixo}`;
    },

    temFiltroAtivo() {
      return (
        criterios.posicao !== "Todas" || criterios.regiao !== "Todas" || Boolean(criterios.busca)
      );
    },
  };
}
