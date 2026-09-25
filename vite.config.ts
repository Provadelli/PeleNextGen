import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Impede que código server-only (segredos, service role) vá para o bundle do navegador.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Cloudflare por padrão; a Vercel troca via NITRO_PRESET=vercel (script vercel-build).
    ...(command === "build"
      ? [
          nitro({
            defaultPreset: "cloudflare-module",
            // Vercel Cron: sincronização diária dos wearables (09:00 UTC / 06:00 BRT).
            vercel: {
              config: {
                version: 3,
                crons: [{ path: "/api/public/hooks/sync-wearables", schedule: "0 9 * * *" }],
              },
            },
          }),
        ]
      : []),
    viteReact(),
  ],
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: { host: "::", port: 8080 },
}));
