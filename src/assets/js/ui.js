/**
 * ui.js — Peças de interface em JavaScript nativo compartilhadas pelas telas:
 * toasts de feedback, abas (tabs), animação de contador e criação de elementos.
 *
 * As classes são utilitárias do Tailwind com os tokens do projeto (bg-bg2, text-primary...).
 * O Tailwind lê estes arquivos .js (via @source "../src" em styles.css), então as classes
 * usadas aqui entram no CSS final normalmente.
 */

/* ------------------------------------------------------------------ */
/* Criação de elementos                                                */
/* ------------------------------------------------------------------ */

/**
 * Atalho para document.createElement com classes, atributos e texto.
 * @param {string} tag
 * @param {{ className?: string, text?: string, attrs?: Record<string, string> }} [opcoes]
 */
export function criar(tag, { className, text, attrs } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  if (attrs) Object.entries(attrs).forEach(([nome, valor]) => el.setAttribute(nome, valor));
  return el;
}

/** Ícones SVG usados nos botões (decorativos: aria-hidden). */
export const ICONES = {
  estrela:
    '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  seta: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 opacity-40 group-aria-pressed:opacity-100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
};

/** Classes de foco visível comuns a todos os botões criados via JS. */
export const FOCO =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

const CORES_TOAST = {
  info: "border-l-blue-light",
  success: "border-l-success",
  error: "border-l-error",
  gold: "border-l-primary",
};

let regiaoToast = null;

/** Região fixa dos toasts, criada uma única vez e anunciada por leitores de tela. */
function obterRegiaoToast() {
  if (regiaoToast?.isConnected) return regiaoToast;
  regiaoToast = criar("div", {
    className:
      "pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96",
    attrs: { role: "status", "aria-live": "polite", "data-vanilla-toasts": "" },
  });
  document.body.appendChild(regiaoToast);
  return regiaoToast;
}

/**
 * Mostra um aviso rápido e remove sozinho.
 * @param {string} mensagem
 * @param {"info"|"success"|"error"|"gold"} [tipo]
 * @param {number} [duracao] em milissegundos
 */
export function mostrarToast(mensagem, tipo = "info", duracao = 3500) {
  const regiao = obterRegiaoToast();

  const toast = criar("div", {
    className: `pointer-events-auto flex items-start gap-3 rounded-xl border border-border border-l-4 ${CORES_TOAST[tipo] ?? CORES_TOAST.info} bg-bg3 px-4 py-3 text-sm text-foreground shadow-card transition-all duration-200 motion-reduce:transition-none translate-y-2 opacity-0`,
  });
  const texto = criar("p", { className: "flex-1", text: mensagem });
  const fechar = criar("button", {
    className: `rounded-md px-1 text-lg leading-none text-muted-foreground hover:text-foreground ${FOCO}`,
    text: "×",
    attrs: { type: "button", "aria-label": "Fechar aviso" },
  });
  toast.append(texto, fechar);
  regiao.appendChild(toast);

  // Entrada: no próximo quadro troca as classes para animar.
  requestAnimationFrame(() => toast.classList.remove("translate-y-2", "opacity-0"));

  // No máximo 3 toasts na tela.
  while (regiao.children.length > 3) regiao.firstElementChild.remove();

  let removido = false;
  const remover = () => {
    if (removido) return;
    removido = true;
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 220);
  };

  fechar.addEventListener("click", remover);
  setTimeout(remover, duracao);
}

/**
 * Animação curta de destaque nos contadores (Web Animations API, sem CSS extra).
 * Respeita quem pediu menos movimento no sistema operacional.
 */
export function pulsar(elemento) {
  if (!elemento || typeof elemento.animate !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  elemento.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
    {
      duration: 300,
      easing: "ease-out",
    },
  );
}

/* ------------------------------------------------------------------ */
/* Abas                                                                */
/* ------------------------------------------------------------------ */

/**
 * Cria um grupo de abas acessível (role="tablist") que troca o conteúdo sem recarregar.
 * Funciona com clique e com as teclas ← → Home End.
 * @param {{ rotulo: string, abas: { id: string, label: string }[], aoTrocar: (id: string) => void }} opcoes
 * @returns {{ elemento: HTMLElement, definirContagem: (id: string, n: number) => void, selecionar: (id: string) => void }}
 */
export function criarAbas({ rotulo, abas, aoTrocar }) {
  const lista = criar("div", {
    className:
      "inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-bg2 p-1",
    attrs: { role: "tablist", "aria-label": rotulo },
  });

  const botoes = abas.map((aba, indice) => {
    const botao = criar("button", {
      className: `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-bg3 aria-selected:text-primary sm:px-4 ${FOCO}`,
      attrs: {
        type: "button",
        role: "tab",
        "aria-selected": String(indice === 0),
        "data-aba": aba.id,
      },
    });
    botao.tabIndex = indice === 0 ? 0 : -1;
    botao.append(document.createTextNode(aba.label));
    const contagem = criar("span", { className: "ml-1 text-xs font-medium text-muted-foreground" });
    botao.appendChild(contagem);
    lista.appendChild(botao);
    return botao;
  });

  const selecionar = (id, focar = false) => {
    botoes.forEach((botao) => {
      const ativa = botao.dataset.aba === id;
      botao.setAttribute("aria-selected", String(ativa));
      botao.tabIndex = ativa ? 0 : -1;
      if (ativa && focar) botao.focus();
    });
    aoTrocar(id);
  };

  lista.addEventListener("click", (evento) => {
    const botao = evento.target.closest('[role="tab"]');
    if (botao) selecionar(botao.dataset.aba);
  });

  lista.addEventListener("keydown", (evento) => {
    const atual = botoes.indexOf(document.activeElement);
    if (atual === -1) return;
    const destino = {
      ArrowRight: (atual + 1) % botoes.length,
      ArrowLeft: (atual - 1 + botoes.length) % botoes.length,
      Home: 0,
      End: botoes.length - 1,
    }[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    selecionar(botoes[destino].dataset.aba, true);
  });

  return {
    elemento: lista,
    selecionar,
    definirContagem(id, n) {
      const botao = botoes.find((b) => b.dataset.aba === id);
      if (botao) botao.querySelector("span").textContent = `(${n})`;
    },
  };
}
