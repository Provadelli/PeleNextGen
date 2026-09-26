/**
 * validation.js — Validação interativa dos formulários de cadastro e login, em JavaScript nativo.
 *
 * Como funciona junto com o React:
 *  - a página React renderiza os campos e, logo abaixo de cada um, um <p id="{campo}-erro"> vazio;
 *  - ativarValidacao() liga os eventos no <form> e escreve as mensagens nesses <p>;
 *  - se houver erro no envio, o evento "submit" é barrado aqui (preventDefault + stopPropagation)
 *    e o envio do React (Supabase) nem chega a rodar;
 *  - se tudo estiver certo, o envio segue normalmente para o handler do React.
 *
 * Eventos usados: focusout (ao sair do campo), input (a cada digitação, depois que o campo
 * já foi visitado) e submit (valida tudo, mostra toast e leva o foco ao primeiro erro).
 */
import { criar, mostrarToast } from "./ui.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------------------------------------------ */
/* Regras: cada uma recebe o valor e devolve a mensagem de erro ou ""  */
/* ------------------------------------------------------------------ */

const regraEmail = (valor) => {
  if (!valor.trim()) return "Informe o e-mail.";
  if (!EMAIL_REGEX.test(valor.trim())) return "Digite um e-mail válido, como nome@email.com.";
  return "";
};

/** Regras do login (src/routes/login.tsx). */
export const REGRAS_LOGIN = [
  { id: "email", regra: regraEmail },
  { id: "senha", regra: (valor) => (valor ? "" : "Digite sua senha.") },
];

/** Regras do cadastro de atleta (src/routes/cadastro.tsx), alinhadas ao schema do Zod da página. */
export const REGRAS_CADASTRO = [
  {
    id: "cad-nome",
    regra: (valor) => {
      const nome = valor.trim();
      if (!nome) return "Informe o nome completo.";
      if (!/^[A-Za-zÀ-ÿ' ]+$/.test(nome)) return "Use apenas letras no nome.";
      if (nome.split(/\s+/).length < 2) return "Informe nome e sobrenome.";
      if (nome.length > 100) return "O nome pode ter no máximo 100 caracteres.";
      return "";
    },
  },
  { id: "cad-email", regra: regraEmail },
  {
    id: "cad-celular",
    regra: (valor) => {
      const digitos = valor.replace(/\D/g, "");
      if (!digitos) return "Informe o celular com DDD.";
      if (digitos.length < 10 || digitos.length > 11)
        return "Digite DDD + número, como (11) 98765-4321.";
      return "";
    },
  },
  {
    id: "cad-senha",
    forca: true,
    regra: (valor) => {
      if (!valor) return "Crie uma senha.";
      if (valor.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
      if (valor.length > 72) return "A senha pode ter no máximo 72 caracteres.";
      return "";
    },
  },
];

/* ------------------------------------------------------------------ */
/* Medidor de força da senha                                           */
/* ------------------------------------------------------------------ */

const NIVEIS = [
  {
    texto: "Use 6 caracteres ou mais. Misture letras, números e símbolos para ficar forte.",
    largura: "w-0",
    cor: "bg-error",
  },
  { texto: "Senha fraca", largura: "w-1/3", cor: "bg-error" },
  { texto: "Senha média", largura: "w-2/3", cor: "bg-primary" },
  { texto: "Senha forte", largura: "w-full", cor: "bg-success" },
];

/** Cria a barra dentro do elemento vazio #{id}-forca e devolve a função que a atualiza. */
function criarMedidorForca(container) {
  const trilho = criar("div", {
    className: "h-1.5 overflow-hidden rounded-full bg-bg3",
    attrs: { "aria-hidden": "true" },
  });
  const barra = criar("div", {
    className:
      "h-full w-0 rounded-full bg-error transition-all duration-300 motion-reduce:transition-none",
  });
  const texto = criar("p", { className: "mt-1 text-xs text-muted-foreground" });
  trilho.appendChild(barra);
  container.replaceChildren(trilho, texto);

  return (senha) => {
    let pontos = 0;
    if (senha.length >= 6) pontos += 1;
    if (/[A-Za-z]/.test(senha) && /\d/.test(senha)) pontos += 1;
    if (/[^A-Za-z0-9]/.test(senha) || senha.length >= 12) pontos += 1;
    const nivel = senha ? NIVEIS[Math.max(pontos, 1)] : NIVEIS[0];
    // Troca as classes do Tailwind conforme o nível (sem estilo inline).
    barra.className = `h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${nivel.largura} ${nivel.cor}`;
    texto.textContent = nivel.texto;
  };
}

/* ------------------------------------------------------------------ */
/* Ligação dos eventos                                                 */
/* ------------------------------------------------------------------ */

/**
 * Ativa a validação em um formulário renderizado pelo React.
 * @param {HTMLFormElement} form
 * @param {{ id: string, regra: (valor: string) => string, forca?: boolean }[]} campos
 * @returns {() => void} limpeza (remove listeners e marcações quando a página desmonta)
 */
export function ativarValidacao(form, campos) {
  const tocados = new Set();
  const porId = new Map(campos.map((campo) => [campo.id, campo]));
  const medidores = new Map();

  campos
    .filter((campo) => campo.forca)
    .forEach((campo) => {
      const container = document.getElementById(`${campo.id}-forca`);
      if (container) medidores.set(campo.id, criarMedidorForca(container));
    });
  medidores.forEach((atualizar, id) => atualizar(document.getElementById(id)?.value ?? ""));

  /** Valida um campo e atualiza aria-invalid e a mensagem. Retorna true se estiver válido. */
  function validar(id) {
    const campo = porId.get(id);
    const input = document.getElementById(id);
    const mensagem = document.getElementById(`${id}-erro`);
    if (!campo || !input) return true;

    const erro = campo.regra(input.value);
    // aria-invalid ativa as classes aria-[invalid=true]: do Input (borda vermelha).
    input.setAttribute("aria-invalid", String(Boolean(erro)));
    if (mensagem) mensagem.textContent = erro;
    return !erro;
  }

  const aoSair = (evento) => {
    const id = evento.target.id;
    if (!porId.has(id)) return;
    tocados.add(id);
    validar(id);
  };

  const aoDigitar = (evento) => {
    const id = evento.target.id;
    if (!porId.has(id)) return;
    medidores.get(id)?.(evento.target.value);
    // Só mostra erro enquanto digita se o campo já foi visitado.
    if (tocados.has(id)) validar(id);
  };

  const aoEnviar = (evento) => {
    const invalidos = campos.map((c) => c.id).filter((id) => !validar(id));
    campos.forEach((c) => tocados.add(c.id));
    if (invalidos.length === 0) return; // tudo certo: o React continua o envio

    // Barra o envio antes de chegar ao handler do React.
    evento.preventDefault();
    evento.stopPropagation();
    document.getElementById(invalidos[0])?.focus();
    mostrarToast(
      invalidos.length === 1
        ? "Corrija o campo destacado para continuar."
        : `Corrija os ${invalidos.length} campos destacados para continuar.`,
      "error",
    );
  };

  form.noValidate = true; // as mensagens são nossas, não os balões do navegador
  form.addEventListener("focusout", aoSair);
  form.addEventListener("input", aoDigitar);
  form.addEventListener("submit", aoEnviar, { capture: true });

  return () => {
    form.removeEventListener("focusout", aoSair);
    form.removeEventListener("input", aoDigitar);
    form.removeEventListener("submit", aoEnviar, { capture: true });
    campos.forEach(({ id }) => {
      document.getElementById(id)?.removeAttribute("aria-invalid");
      const mensagem = document.getElementById(`${id}-erro`);
      if (mensagem) mensagem.textContent = "";
    });
    medidores.forEach((_, id) => document.getElementById(`${id}-forca`)?.replaceChildren());
  };
}
