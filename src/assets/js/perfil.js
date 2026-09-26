/**
 * perfil.js — Interações no perfil público do atleta (rota /a/$atletaId).
 *
 * A página React renderiza um elemento vazio e chama montarInteracoesPerfil().
 * Este módulo cria, em DOM puro, o bloco "Interações da comunidade":
 *  - votar, favoritar e seguir o atleta;
 *  - abas "Atributos" e "Seus registros" trocadas sem recarregar;
 *  - tags de atributos que o olheiro confirma com um clique.
 */
import { criar, criarAbas } from "./ui.js";
import { tem } from "./store.js";
import { atributosDaPosicao, idDoAtributo } from "./data.js";
import {
  criarListaDeTags,
  criarBotaoVoto,
  criarBotaoSeguir,
  criarBotaoFavorito,
  ligarInteracoes,
} from "./interacoes.js";

/**
 * @param {HTMLElement} raiz elemento vazio renderizado pelo React
 * @param {{ id: string, nome: string, posicao: string|null }} atleta
 * @returns {() => void} limpeza
 */
export function montarInteracoesPerfil(raiz, atleta) {
  const titulo = criar("div", { className: "flex flex-wrap items-center justify-between gap-3" });
  const textos = criar("div");
  textos.append(
    criar("h2", {
      className: "font-display text-xs font-bold uppercase tracking-[0.22em] text-primary",
      text: "Interações da comunidade",
    }),
    criar("p", {
      className: "mt-1 text-sm text-muted-foreground",
      text: `Viu ${atleta.nome} jogar? Vote, siga e confirme os atributos que você observou.`,
    }),
  );
  const botoes = criar("div", { className: "flex items-center gap-2" });
  botoes.append(
    criarBotaoVoto(atleta),
    criarBotaoFavorito(atleta.id, atleta.nome),
    criarBotaoSeguir(atleta.id, atleta.nome),
  );
  titulo.append(textos, botoes);

  /* Painel 1: atributos confirmáveis */
  const painelAtributos = criar("div", { attrs: { role: "tabpanel", "aria-label": "Atributos" } });
  painelAtributos.append(
    criar("p", {
      className: "mb-3 text-sm text-muted-foreground",
      text: "Toque em um atributo para confirmar. Toque de novo para desfazer.",
    }),
    criarListaDeTags(atleta),
  );

  /* Painel 2: resumo do que o usuário já fez neste perfil */
  const painelResumo = criar("div", {
    className: "hidden",
    attrs: { role: "tabpanel", "aria-label": "Seus registros" },
  });
  const listaResumo = criar("ul", { className: "grid gap-2 text-sm sm:grid-cols-2" });
  painelResumo.appendChild(listaResumo);

  function atualizarResumo() {
    const atributos = atributosDaPosicao(atleta.posicao);
    const confirmados = atributos.filter((label) =>
      tem("tags", `${atleta.id}:${idDoAtributo(label)}`),
    );
    const linhas = [
      ["Voto", tem("votos", atleta.id) ? "Registrado" : "Ainda não votou"],
      ["Seguindo", tem("seguindo", atleta.id) ? "Sim" : "Não"],
      ["Favorito", tem("favoritos", atleta.id) ? "Sim" : "Não"],
      [
        "Atributos confirmados",
        confirmados.length
          ? `${confirmados.length} de ${atributos.length}: ${confirmados.join(", ")}`
          : `0 de ${atributos.length}`,
      ],
    ];
    listaResumo.replaceChildren(
      ...linhas.map(([rotulo, valor]) => {
        const item = criar("li", { className: "rounded-xl bg-bg3 px-4 py-3" });
        item.append(
          criar("span", { className: "block text-xs text-muted-foreground", text: rotulo }),
          criar("span", { className: "font-semibold", text: valor }),
        );
        return item;
      }),
    );
  }

  const abas = criarAbas({
    rotulo: "Seções das interações",
    abas: [
      { id: "atributos", label: "Atributos" },
      { id: "resumo", label: "Seus registros" },
    ],
    aoTrocar: (id) => {
      painelAtributos.classList.toggle("hidden", id !== "atributos");
      painelResumo.classList.toggle("hidden", id !== "resumo");
      if (id === "resumo") atualizarResumo();
    },
  });

  const corpo = criar("div", { className: "mt-5 grid gap-4" });
  corpo.append(abas.elemento, painelAtributos, painelResumo);
  raiz.replaceChildren(titulo, corpo);

  const desligar = ligarInteracoes(raiz, atualizarResumo);
  atualizarResumo();

  return () => {
    desligar();
    raiz.replaceChildren();
  };
}
