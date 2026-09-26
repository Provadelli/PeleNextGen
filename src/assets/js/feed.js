/**
 * feed.js — Feed de atletas (rota /feed), montado em JavaScript nativo.
 *
 * A página React (src/routes/feed.tsx) busca os atletas no Supabase e entrega a lista
 * para montarFeed(). A partir daí, tudo dentro da área do feed é DOM puro:
 *  - cards criados com createElement;
 *  - abas "Todos", "Seguindo" e "Favoritos" sem recarregar a página;
 *  - filtros por posição, região e busca (filters.js);
 *  - votos, tags, seguir e favoritar (interacoes.js);
 *  - contagem de resultados e estado vazio atualizados a cada mudança.
 */
import { criar, criarAbas, FOCO } from "./ui.js";
import { tem } from "./store.js";
import { criarFiltros } from "./filters.js";
import { iniciais, regiaoDaCidade, ufDaCidade } from "./data.js";
import {
  criarListaDeTags,
  criarBotaoVoto,
  criarBotaoSeguir,
  criarBotaoFavorito,
  ligarInteracoes,
} from "./interacoes.js";

/**
 * @typedef {{ id: string, nome: string, posicao: string|null, cidade: string|null, avatar_url: string|null }} AtletaFeed
 */

/** Avatar: foto quando existe, senão as iniciais. */
function criarAvatar(atleta) {
  if (atleta.avatar_url) {
    return criar("img", {
      className: "h-12 w-12 shrink-0 rounded-full border border-primary/40 object-cover",
      attrs: { src: atleta.avatar_url, alt: "", loading: "lazy", width: "48", height: "48" },
    });
  }
  return criar("span", {
    className:
      "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-gold font-bold text-primary-foreground",
    text: iniciais(atleta.nome),
    attrs: { "aria-hidden": "true" },
  });
}

/**
 * Card de um atleta. Os dados para filtros ficam em data-*.
 * @param {AtletaFeed} atleta
 * @param {(id: string) => void} [aoAbrirPerfil]
 */
function criarCard(atleta, aoAbrirPerfil) {
  const item = criar("li", {
    attrs: {
      "data-id": atleta.id,
      "data-posicao": atleta.posicao ?? "",
      "data-regiao": regiaoDaCidade(atleta.cidade) ?? "",
      "data-busca": `${atleta.nome} ${atleta.cidade ?? ""}`,
    },
  });

  const card = criar("article", {
    className:
      "flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40",
  });

  /* Cabeçalho: avatar, nome, cidade, posição e favorito */
  const topo = criar("div", { className: "flex items-start gap-3" });
  const info = criar("div", { className: "min-w-0 flex-1" });

  const titulo = criar("h2", { className: "truncate text-base font-semibold" });
  const link = criar("a", {
    className: `rounded hover:text-primary hover:underline ${FOCO}`,
    text: atleta.nome,
    attrs: { href: `/a/${atleta.id}` },
  });
  // Navega pelo roteador do React (sem recarregar); Ctrl/Cmd+clique continua abrindo em nova aba.
  link.addEventListener("click", (evento) => {
    if (
      !aoAbrirPerfil ||
      evento.ctrlKey ||
      evento.metaKey ||
      evento.shiftKey ||
      evento.button !== 0
    )
      return;
    evento.preventDefault();
    aoAbrirPerfil(atleta.id);
  });
  titulo.appendChild(link);

  const uf = ufDaCidade(atleta.cidade);
  const local = atleta.cidade ? atleta.cidade : "Cidade não informada";
  info.append(
    titulo,
    criar("p", {
      className: "truncate text-sm text-muted-foreground",
      text: uf && !atleta.cidade?.includes(uf) ? `${local}, ${uf}` : local,
    }),
    criar("span", {
      className:
        "mt-1 inline-block rounded-full bg-blue/30 px-2 py-0.5 text-xs font-semibold text-blue-light",
      text: atleta.posicao ?? "Posição não informada",
    }),
  );

  topo.append(criarAvatar(atleta), info, criarBotaoFavorito(atleta.id, atleta.nome));

  /* Ações: voto e seguir */
  const acoes = criar("div", {
    className: "mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3",
  });
  const seguir = criarBotaoSeguir(atleta.id, atleta.nome);
  seguir.classList.add("ml-auto");
  acoes.append(criarBotaoVoto(atleta), seguir);

  card.append(topo, criarListaDeTags(atleta), acoes);
  item.appendChild(card);
  return item;
}

/** Estado vazio com mensagem que muda conforme a aba e os filtros. */
function criarEstadoVazio(aoLimpar) {
  const caixa = criar("div", {
    className: "hidden rounded-2xl border border-dashed border-border px-4 py-12 text-center",
  });
  const titulo = criar("h2", { className: "text-lg font-semibold" });
  const texto = criar("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground" });
  const botao = criar("button", {
    className: `mt-4 inline-flex h-10 items-center rounded-lg bg-gradient-gold px-4 text-sm font-semibold text-primary-foreground shadow-gold hover:brightness-105 ${FOCO}`,
    text: "Ver todos os atletas",
    attrs: { type: "button" },
  });
  botao.addEventListener("click", aoLimpar);
  caixa.append(titulo, texto, botao);
  return { caixa, titulo, texto };
}

/**
 * Monta o feed dentro de um elemento vazio.
 * @param {HTMLElement} raiz
 * @param {AtletaFeed[]} atletas
 * @param {{ aoAbrirPerfil?: (id: string) => void }} [opcoes]
 * @returns {() => void} limpeza: remove listeners e o conteúdo (quando a página React desmonta)
 */
export function montarFeed(raiz, atletas, { aoAbrirPerfil } = {}) {
  let abaAtual = "todos";

  const grade = criar("ul", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" });
  atletas.forEach((atleta) => grade.appendChild(criarCard(atleta, aoAbrirPerfil)));

  const filtros = criarFiltros({ aoFiltrar: () => atualizar() });

  const abas = criarAbas({
    rotulo: "Mostrar no feed",
    abas: [
      { id: "todos", label: "Todos" },
      { id: "seguindo", label: "Seguindo" },
      { id: "favoritos", label: "Favoritos" },
    ],
    aoTrocar: (id) => {
      abaAtual = id;
      atualizar();
    },
  });

  const vazio = criarEstadoVazio(() => {
    filtros.limpar();
    if (abaAtual !== "todos") abas.selecionar("todos");
  });

  const painel = criar("div", {
    className: "grid gap-4",
    attrs: { role: "tabpanel", "aria-label": "Lista de atletas" },
  });
  painel.append(grade, vazio.caixa);

  /** Aplica aba + filtros: alterna a classe "hidden" em cada card, sem recriar nada. */
  function atualizar() {
    let visiveis = 0;
    grade.querySelectorAll(":scope > li").forEach((card) => {
      const naAba =
        abaAtual === "todos" ||
        (abaAtual === "seguindo" && tem("seguindo", card.dataset.id)) ||
        (abaAtual === "favoritos" && tem("favoritos", card.dataset.id));
      const mostrar = naAba && filtros.passa(card);
      card.classList.toggle("hidden", !mostrar);
      if (mostrar) visiveis += 1;
    });

    filtros.mostrarContagem(visiveis);
    grade.classList.toggle("hidden", visiveis === 0);
    vazio.caixa.classList.toggle("hidden", visiveis > 0);

    // Números ao lado das abas.
    const ids = atletas.map((a) => a.id);
    abas.definirContagem("seguindo", ids.filter((id) => tem("seguindo", id)).length);
    abas.definirContagem("favoritos", ids.filter((id) => tem("favoritos", id)).length);

    // Texto do estado vazio conforme o motivo.
    if (atletas.length === 0) {
      vazio.titulo.textContent = "Nenhum atleta cadastrado ainda";
      vazio.texto.textContent = "Quando novos atletas se cadastrarem, eles aparecem aqui.";
    } else if (abaAtual === "seguindo" && !filtros.temFiltroAtivo()) {
      vazio.titulo.textContent = "Você ainda não segue nenhum atleta";
      vazio.texto.textContent = "Na aba Todos, toque em Seguir nos atletas que quer acompanhar.";
    } else if (abaAtual === "favoritos" && !filtros.temFiltroAtivo()) {
      vazio.titulo.textContent = "Nenhum favorito ainda";
      vazio.texto.textContent = "Toque na estrela de um atleta para guardá-lo aqui.";
    } else {
      vazio.titulo.textContent = "Nenhum atleta com esses filtros";
      vazio.texto.textContent =
        "Tente outra posição ou região, ou limpe os filtros para ver todos.";
    }
  }

  raiz.replaceChildren(abas.elemento, filtros.elemento, painel);

  // Depois de seguir/favoritar, reavalia a aba (ex.: deixar de seguir na aba "Seguindo").
  const desligar = ligarInteracoes(grade, atualizar);
  atualizar();

  return () => {
    desligar();
    raiz.replaceChildren();
  };
}
