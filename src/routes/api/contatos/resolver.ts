import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAdmin, getUserIdFromBearer } from "@/server/wearables.server";

const BodySchema = z.object({
  solicitacaoId: z.string().uuid(),
  decisao: z.enum(["liberado", "recusado"]),
  observacao: z.string().trim().max(500).optional(),
});

/**
 * Resolução de uma solicitação de desbloqueio — só equipe de suporte.
 * Ao liberar, a linha em `contatos_desbloqueados` é criada aqui, no servidor.
 */
export const Route = createFileRoute("/api/contatos/resolver")({
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

        const { data: roles, error: rolesErr } = await admin
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if (rolesErr) return new Response("Erro ao validar permissões", { status: 500 });
        if (!(roles ?? []).some((r) => r.role === "suporte")) {
          return new Response("Apenas a equipe de suporte pode resolver solicitações", {
            status: 403,
          });
        }

        // Atualização condicional: só resolve quem ainda está pendente (evita dupla ação).
        const { data: sol, error: updErr } = await admin
          .from("solicitacoes_desbloqueio")
          .update({
            status: parsed.decisao,
            resolvido_em: new Date().toISOString(),
            resolvido_por: uid,
            observacao: parsed.observacao || null,
          })
          .eq("id", parsed.solicitacaoId)
          .eq("status", "pendente")
          .select("clube_id, candidato_id")
          .maybeSingle();
        if (updErr) {
          console.error("[contatos/resolver] update failed", updErr.code);
          return new Response("Não foi possível resolver a solicitação", { status: 500 });
        }
        if (!sol) return new Response("Solicitação inexistente ou já resolvida", { status: 409 });

        if (parsed.decisao === "liberado") {
          const { error } = await admin
            .from("contatos_desbloqueados")
            .insert({ clube_id: sol.clube_id, candidato_id: sol.candidato_id });
          // 23505 = já desbloqueado, tratamos como sucesso idempotente.
          if (error && error.code !== "23505") {
            console.error("[contatos/resolver] insert failed", error.code);
            // Devolve a solicitação à fila para a equipe tentar de novo.
            await admin
              .from("solicitacoes_desbloqueio")
              .update({ status: "pendente", resolvido_em: null, resolvido_por: null })
              .eq("id", parsed.solicitacaoId);
            return new Response("Não foi possível liberar o contato", { status: 500 });
          }
        }

        const liberado = parsed.decisao === "liberado";
        const { error: notifErr } = await admin.from("notifications").insert({
          user_id: sol.clube_id,
          kind: liberado ? "contact_unlocked" : "system",
          title: liberado ? "Contato liberado" : "Solicitação recusada",
          body: liberado
            ? "A equipe liberou o contato do atleta que você solicitou."
            : parsed.observacao || "A equipe não liberou o contato solicitado.",
          link: "/clubes",
          data: { solicitacao_id: parsed.solicitacaoId },
        });
        if (notifErr) console.error("[contatos/resolver] notify failed", notifErr.code);

        return Response.json({ ok: true });
      },
    },
  },
});
