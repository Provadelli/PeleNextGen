import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Metadados aceitos no cadastro de atleta — o resto é descartado. O papel é
// sempre "atleta" (atribuído pelo trigger handle_new_user), nunca vem daqui.
const ALLOWED_METADATA = [
  "nome",
  "celular",
  "data_nascimento",
  "posicao",
  "altura",
  "peso",
  "pe",
  "termos_aceitos_em",
  "termos_versao",
] as const;

// Cria a conta de atleta JÁ CONFIRMADA, sem enviar o e-mail de confirmação
// do Supabase. Medida temporária para não estourar o limite de e-mails do
// SMTP padrão (ver CONFIRMAR_EMAIL_ATLETA em src/routes/cadastro.tsx).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const rawMeta = (body?.metadata ?? {}) as Record<string, unknown>;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
      return json({ error: "E-mail inválido." }, 400);
    }
    if (password.length < 6 || password.length > 72) {
      return json({ error: "A senha deve ter entre 6 e 72 caracteres." }, 400);
    }

    const metadata: Record<string, string> = {};
    for (const key of ALLOWED_METADATA) {
      const v = rawMeta[key];
      if (v != null && v !== "") metadata[key] = String(v).slice(0, 200);
    }
    if (!metadata.nome) return json({ error: "Informe seu nome." }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (createErr || !created.user) {
      const msg = createErr?.message ?? "Falha ao criar conta.";
      const exists = /already|registered|exists/i.test(msg);
      return json(
        {
          error: exists ? "Este e-mail já está cadastrado. Faça login ou recupere sua senha." : msg,
          code: exists ? "user_already_exists" : undefined,
        },
        exists ? 409 : 400,
      );
    }

    return json({ user_id: created.user.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
