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

function extOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

// Cria uma conta pendente de aprovação (admin/olheiro ou clube) sem disparar o
// e-mail nativo de confirmação do Supabase. O e-mail só é enviado depois que o
// suporte aprova a solicitação (ver approveRequest em src/routes/suporte.tsx),
// via supabase.auth.resend().
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const form = await req.formData();
    const kind = form.get("kind");
    const email = (form.get("email") as string | null)?.trim();
    const password = form.get("password") as string | null;
    const metadataRaw = form.get("metadata") as string | null;

    if (!email || !password || (kind !== "admin" && kind !== "clube")) {
      return json({ error: "Dados inválidos." }, 400);
    }

    let metadata: Record<string, unknown> = {};
    try {
      metadata = metadataRaw ? JSON.parse(metadataRaw) : {};
    } catch {
      return json({ error: "Metadados inválidos." }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: metadata,
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Falha ao criar conta." }, 400);
    }
    const userId = created.user.id;

    if (kind === "admin") {
      const celular = form.get("celular") as string | null;
      const idade = Number(form.get("idade"));
      const clubeAtual = form.get("clubeAtual") as string | null;
      const rgFrente = form.get("rgFrente");
      const rgVerso = form.get("rgVerso");

      if (!(rgFrente instanceof File) || !(rgVerso instanceof File)) {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: "Envie as duas fotos do RG." }, 400);
      }

      const frentePath = `${userId}/rg-frente.${extOf(rgFrente)}`;
      const versoPath = `${userId}/rg-verso.${extOf(rgVerso)}`;

      const [{ error: upFrenteErr }, { error: upVersoErr }] = await Promise.all([
        admin.storage
          .from("admin-docs")
          .upload(frentePath, rgFrente, { upsert: true, contentType: rgFrente.type }),
        admin.storage
          .from("admin-docs")
          .upload(versoPath, rgVerso, { upsert: true, contentType: rgVerso.type }),
      ]);
      if (upFrenteErr || upVersoErr) {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: "Falha ao enviar as imagens do RG." }, 500);
      }

      const { error: reqErr } = await admin.from("admin_requests").insert({
        user_id: userId,
        status: "pending",
        celular,
        idade: Number.isFinite(idade) ? idade : null,
        clube_atual: clubeAtual,
        rg_frente_path: frentePath,
        rg_verso_path: versoPath,
      } as never);
      if (reqErr && reqErr.code !== "23505") {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: reqErr.message }, 500);
      }
    } else {
      const { error: reqErr } = await admin
        .from("clube_requests")
        .insert({ user_id: userId, status: "pending" });
      if (reqErr && reqErr.code !== "23505") {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: reqErr.message }, 500);
      }
    }

    return json({ user_id: userId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
