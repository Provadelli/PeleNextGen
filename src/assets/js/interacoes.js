/**
 * interacoes.js — Ações do usuário sobre atletas e olheiros, usadas no feed e nos perfis:
 *  - confirmar tags de atributos (ex.: "Velocidade");
 *  - votar no atleta (contador que muda na hora);
 *  - seguir atletas e olheiros;
 *  - favoritar atletas e olheiros.
 *
 * Os botões são criados com createElement. As ações usam delegação de eventos:
 * um único addEventListener no container atende todos os botões dele. Quando o mesmo
 * atleta aparece em mais de um lugar, todos os botões dele são atualizados juntos.
 *
 * Os votos e confirmações ficam salvos neste navegador (store.js); a contagem mostra
 * a contribuição do usuário até existir uma tabela própria no Supabase.
 */
import { tem, alternar } from "./store.js";
import { criar, ICONES, FOCO, mostrarToast, pulsar } from "./ui.js";
import { atributosDaPosicao, idDoAtributo } from "./data.js";

/* ------------------------------------------------------------------ */
/* Criação dos botões                                                  */
/* ------------------------------------------------------------------ */

/**
 * Lista de tags de atributos confirmáveis para um atleta.
 * @param {{ id: string, nome: string, posicao: string|null }} atleta
 */
export function criarListaDeTags(atleta) {
  const lista = criar("ul", {
    className: "flex flex-wrap gap-2",
    attrs: { "aria-label": `Atributos de ${atleta.nome}` },
  });

  atributosDaPosicao(atleta.posicao).forEach((label) => {
    const idTag = idDoAtributo(label);
    const item = criar("li");
    const botao = criar("button", {
      className: `group inline-flex min-h-9 items-center gap-2 rounded-full border border-dashed border-primary/45 px-3 py-1 text-sm transition-colors hover:bg-primary/10 active:scale-95 aria-pressed:border-solid aria-pressed:border-primary aria-pressed:bg-primary/15 aria-pressed:text-primary ${FOCO}`,
      attrs: {
        type: "button",
        "data-acao": "confirmar-tag",
        "data-atleta": atleta.id,
        "data-tag": idTag,
        "data-label": label,
        "data-nome": atleta.nome,
      },
    });
    botao.innerHTML = ICONES.check;
    botao.append(criar("span", { text: label }));
    atualizarTag(botao, tem("tags", `${atleta.id}:${idTag}`));
    item.appendChild(botao);
    lista.appendChild(item);
  });

  return lista;
}

/** Botão de voto com contador. */
export function criarBotaoVoto(atleta) {
  const botao = criar("button", {
    className: `inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-bg3 px-3 font-semibold transition-colors hover:border-blue-light/60 active:scale-95 aria-pressed:border-blue-light aria-pressed:bg-blue/30 ${FOCO}`,
    attrs: {
      type: "button",
      "data-acao": "votar",
      "data-atleta": atleta.id,
      "data-nome": atleta.nome,
    },
  });
  botao.innerHTML = ICONES.seta;
  botao.append(
    criar("span", { className: "tabular-nums", attrs: { "data-contagem": "" } }),
    criar("span", {
      className: "text-xs font-medium text-muted-foreground",
      attrs: { "data-rotulo": "" },
    }),
  );
  atualizarVoto(botao, tem("votos", atleta.id));
  return botao;
}

/**
 * Botão Seguir/Seguindo (atletas e olheiros).
 * @param {string} id
 * @param {string} nome
 */
export function criarBotaoSeguir(id, nome) {
  const botao = criar("button", {
    className: `inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-bg3 px-4 text-sm font-semibold transition-colors hover:border-primary/50 active:scale-95 aria-pressed:border-primary aria-pressed:bg-primary/15 aria-pressed:text-primary ${FOCO}`,
    attrs: { type: "button", "data-acao": "seguir", "data-id": id, "data-nome": nome },
  });
  atualizarSeguir(botao, tem("seguindo", id));
  return botao;
}

/**
 * Botão estrela de favorito (atletas e olheiros).
 * @param {string} id
 * @param {string} nome
 */
export function criarBotaoFavorito(id, nome) {
  const botao = criar("button", {
    className: `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg3 text-muted-foreground transition-colors hover:text-primary active:scale-95 aria-pressed:border-primary aria-pressed:text-primary [&[aria-pressed=true]_svg]:fill-current ${FOCO}`,
    attrs: { type: "button", "data-acao": "favoritar", "data-id": id, "data-nome": nome },
  });
  botao.innerHTML = ICONES.estrela;
  atualizarFavorito(botao, tem("favoritos", id));
  return botao;
}

/* ------------------------------------------------------------------ */
/* Atualização visual (aria-pressed controla as classes do Tailwind)   */
/* ------------------------------------------------------------------ */

function atualizarTag(botao, confirmada) {
  // aria-pressed já informa ao leitor de tela se o atributo está confirmado.
  botao.setAttribute("aria-pressed", String(confirmada));
  botao.title = confirmada
    ? "Confirmado por você. Clique para desfazer."
    : "Clique para confirmar este atributo.";
}

function atualizarVoto(botao, votado) {
  const total = votado ? 1 : 0;
  botao.setAttribute("aria-pressed", String(votado));
  botao.querySelector("[data-contagem]").textContent = total;
  botao.querySelector("[data-rotulo]").textContent = total === 1 ? "voto" : "votos";
  botao.setAttribute(
    "aria-label",
    `${votado ? "Remover voto de" : "Votar em"} ${botao.dataset.nome}. ${total} ${total === 1 ? "voto" : "votos"}`,
  );
}

function atualizarSeguir(botao, seguindo) {
  botao.setAttribute("aria-pressed", String(seguindo));
  botao.textContent = seguindo ? "Seguindo" : "Seguir";
  botao.setAttribute(
    "aria-label",
    `${seguindo ? "Deixar de seguir" : "Seguir"} ${botao.dataset.nome}`,
  );
}

function atualizarFavorito(botao, favorito) {
  botao.setAttribute("aria-pressed", String(favorito));
  botao.setAttribute(
    "aria-label",
    `${favorito ? "Remover" : "Adicionar"} ${botao.dataset.nome} ${favorito ? "dos" : "aos"} favoritos`,
  );
}

/* ------------------------------------------------------------------ */
/* Cliques (delegação de eventos)                                      */
/* ------------------------------------------------------------------ */

/**
 * Liga as interações dentro de um container.
 * @param {HTMLElement} container
 * @param {(acao: string) => void} [aoMudar] chamado depois de cada ação
 * @returns {() => void} função que remove o listener (usada quando a tela React desmonta)
 */
export function ligarInteracoes(container, aoMudar) {
  const aoClicar = (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao || !container.contains(botao)) return;
    const { acao, nome } = botao.dataset;

    if (acao === "confirmar-tag") {
      const { atleta, tag, label } = botao.dataset;
      const confirmada = alternar("tags", `${atleta}:${tag}`);
      document
        .querySelectorAll(`[data-acao="confirmar-tag"][data-atleta="${atleta}"][data-tag="${tag}"]`)
        .forEach((b) => atualizarTag(b, confirmada));
      pulsar(botao);
      mostrarToast(
        confirmada
          ? `Você confirmou "${label}" em ${nome}.`
          : `Confirmação de "${label}" removida.`,
        confirmada ? "success" : "info",
      );
    }

    if (acao === "votar") {
      const votado = alternar("votos", botao.dataset.atleta);
      document
        .querySelectorAll(`[data-acao="votar"][data-atleta="${botao.dataset.atleta}"]`)
        .forEach((b) => atualizarVoto(b, votado));
      pulsar(botao.querySelector("[data-contagem]"));
      mostrarToast(
        votado ? `Voto registrado para ${nome}.` : `Voto em ${nome} removido.`,
        votado ? "success" : "info",
      );
    }

    if (acao === "seguir") {
      const seguindo = alternar("seguindo", botao.dataset.id);
      document
        .querySelectorAll(`[data-acao="seguir"][data-id="${botao.dataset.id}"]`)
        .forEach((b) => atualizarSeguir(b, seguindo));
      mostrarToast(
        seguindo ? `Agora você segue ${nome}.` : `Você deixou de seguir ${nome}.`,
        seguindo ? "success" : "info",
      );
    }

    if (acao === "favoritar") {
      const favorito = alternar("favoritos", botao.dataset.id);
      document
        .querySelectorAll(`[data-acao="favoritar"][data-id="${botao.dataset.id}"]`)
        .forEach((b) => atualizarFavorito(b, favorito));
      mostrarToast(
        favorito ? `${nome} foi adicionado aos favoritos.` : `${nome} saiu dos favoritos.`,
        favorito ? "gold" : "info",
      );
    }

    if (aoMudar) aoMudar(acao);
  };

  container.addEventListener("click", aoClicar);
  return () => container.removeEventListener("click", aoClicar);
}

/**
 * Monta os botões Seguir + Favoritar dentro de um elemento (perfil do olheiro).
 * @param {HTMLElement} raiz elemento vazio renderizado pelo React
 * @param {{ id: string, nome: string }} pessoa
 * @returns {() => void} limpeza
 */
export function montarSeguirFavoritar(raiz, pessoa) {
  const linha = criar("div", { className: "flex items-center gap-2" });
  const seguir = criarBotaoSeguir(pessoa.id, pessoa.nome);
  seguir.classList.add("flex-1");
  linha.append(seguir, criarBotaoFavorito(pessoa.id, pessoa.nome));
  raiz.replaceChildren(linha);

  const desligar = ligarInteracoes(raiz);
  return () => {
    desligar();
    raiz.replaceChildren();
  };
}
