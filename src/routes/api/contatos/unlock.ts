import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, getUserIdFromBearer } from "@/server/wearables.server";

const BodySchema = z.object({
  candidatoId: z.string().uuid(),
});

/**
 * Solicitação de desbloqueio de contato (modelo concierge).
 * O clube só registra o pedido; quem libera é a equipe de suporte, em
 * /api/contatos/resolver. Não há cobrança automática nesta etapa.
 */
export const Route = createFileRoute("/api/contatos/unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const uid = await getUserIdFromBearer(request.headers.get("authorization"));
        if (!uid) return new Response("Unauthorized", { status: 401 });

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response("Requisição inválida", { status: 400 });
        }

        const admin = getAdmin();

        // Só clubes podem solicitar desbloqueio.
        const { data: roles, error: rolesErr } = await admin
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if (rolesErr) return new Response("Erro ao validar permissões", { status: 500 });
        if (!(roles ?? []).some((r) => r.role === "clube")) {
          return new Response("Apenas clubes podem solicitar desbloqueio", { status: 403 });
        }

        // O alvo precisa existir: um candidato de peneira OU qualquer atleta da
        // plataforma (nesse caso o id é o próprio user_id do atleta).
        const { data: cand } = await admin
          .from("candidatos")
          .select("id")
          .eq("id", parsed.candidatoId)
          .maybeSingle();
        if (!cand) {
          const { data: atleta } = await admin
            .from("user_roles")
            .select("user_id")
            .eq("user_id", parsed.candidatoId)
            .eq("role", "atleta")
            .maybeSingle();
          if (!atleta) return new Response("Atleta não encontrado", { status: 404 });
        }

        // Já liberado: nada a pedir.
        const { data: jaLiberado } = await admin
          .from("contatos_desbloqueados")
          .select("id")
          .eq("clube_id", uid)
          .eq("candidato_id", parsed.candidatoId)
          .maybeSingle();
        if (jaLiberado) return Response.json({ ok: true, status: "liberado" });

        const { data: criada, error } = await admin
          .from("solicitacoes_desbloqueio")
          .insert({ clube_id: uid, candidato_id: parsed.candidatoId })
          .select("id")
          .single();
        // 23505 = já existe pedido pendente; tratamos como sucesso idempotente.
        if (error?.code === "23505") return Response.json({ ok: true, status: "pendente" });
        if (error || !criada) {
          console.error("[contatos/unlock] insert failed", error?.code);
          return new Response("Não foi possível registrar a solicitação", { status: 500 });
        }

        // Avisa a equipe (notificação interna; não há provedor de e-mail configurado).
        const [{ data: equipe }, { data: clube }, { data: alvo }] = await Promise.all([
          admin.from("user_roles").select("user_id").eq("role", "suporte"),
          admin.from("profiles").select("nome, nome_clube").eq("id", uid).maybeSingle(),
          admin.from("profiles").select("nome").eq("id", parsed.candidatoId).maybeSingle(),
        ]);
        const quem = clube?.nome_clube || clube?.nome || "Um clube";
        const nomeAtleta = alvo?.nome ? ` de ${alvo.nome}` : "";
        if (equipe && equipe.length > 0) {
          const { error: notifErr } = await admin.from("notifications").insert(
            equipe.map((m) => ({
              user_id: m.user_id,
              kind: "system",
              title: "Nova solicitação de desbloqueio",
              body: `${quem} pediu o contato${nomeAtleta}.`,
              link: "/suporte",
              data: { solicitacao_id: criada.id },
            })),
          );
          if (notifErr) console.error("[contatos/unlock] notify failed", notifErr.code);
        }

        return Response.json({ ok: true, status: "pendente" });
      },
    },
  },
});
