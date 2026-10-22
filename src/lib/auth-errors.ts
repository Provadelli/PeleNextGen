/**
 * Traduz erros do Supabase Auth para mensagens em PT-BR.
 * O caso principal é o limite de envio de e-mails (HTTP 429), que antes
 * aparecia cru para o usuário como "email rate limit exceeded".
 */
export function traduzirErroAuth(
  error: { message?: string; code?: string; status?: number } | null | undefined,
  fallback = "Algo deu errado. Tente novamente.",
): string {
  if (!error) return fallback;
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";

  if (code === "over_email_send_rate_limit" || msg.includes("email rate limit")) {
    return "Muitas tentativas de envio de e-mail. Aguarde alguns minutos e tente novamente.";
  }
  if (code === "over_request_rate_limit" || error.status === 429 || msg.includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  if (code === "user_already_exists" || /already.*registered|already been registered/.test(msg)) {
    return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  }
  if (code === "weak_password" || msg.includes("password should be at least")) {
    return "A senha é muito fraca. Use ao menos 6 caracteres.";
  }
  if (msg.includes("unable to validate email") || msg.includes("invalid email")) {
    return "E-mail inválido.";
  }
  if (msg.includes("non-2xx") || msg.includes("failed to send a request")) {
    return "Não foi possível concluir o cadastro agora. Tente novamente em instantes.";
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada e o spam.";
  }
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  return error.message || fallback;
}

/**
 * Extrai e traduz a mensagem de erro devolvida por uma edge function do Supabase
 * (o `error.message` do invoke é genérico: "Edge Function returned a non-2xx status code").
 */
export async function mensagemDaFunction(err: unknown): Promise<string> {
  const ctx = (err as { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    const body = await ctx.json().catch(() => null);
    if (body?.error) return traduzirErroAuth({ message: body.error, code: body.code });
  }
  return traduzirErroAuth(err as { message?: string });
}
