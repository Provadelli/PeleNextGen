import { timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getAdmin, syncConnection } from "@/server/wearables.server";

// Called daily by Vercel Cron. Auth via `Authorization: Bearer <CRON_SECRET>`.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handleSync({ request }: { request: Request }) {
  if (!process.env.CRON_SECRET) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const admin = getAdmin();
  const { data: conns, error } = await admin
    .from("wearable_connections")
    .select("id");
  if (error) return new Response(error.message, { status: 500 });

  let ok = 0;
  let fail = 0;
  for (const c of conns ?? []) {
    try {
      await syncConnection(c.id);
      ok++;
    } catch (e) {
      fail++;
      console.error("[cron sync-wearables]", c.id, e);
    }
  }
  return Response.json({ ok, fail, total: (conns ?? []).length });
}

// GET: Vercel Cron (envia o Bearer CRON_SECRET automaticamente). POST: chamadas manuais / pg_cron.
export const Route = createFileRoute("/api/public/hooks/sync-wearables")({
  server: {
    handlers: {
      GET: handleSync,
      POST: handleSync,
    },
  },
});
