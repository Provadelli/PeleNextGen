// Auditoria de layout em 3 breakpoints + prints. Uso:
//   node scripts/responsive-audit.mjs <baseUrl> [--prints] [--theme=dark|light]
// Mede rolagem lateral, elementos fora da tela e alvos de toque < 44px (só em 375px).
// Com --prints grava docs/design-system/prints/<tela>-<375|768|1280>[-claro].png.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--")) ?? "http://localhost:8080";
const prints = args.includes("--prints");
const theme = args.find((a) => a.startsWith("--theme="))?.split("=")[1] ?? "dark";
const OUT = "docs/design-system/prints";
if (prints) mkdirSync(OUT, { recursive: true });

const TELAS = [
  ["home", "/"],
  ["login", "/login"],
  ["cadastro", "/cadastro"],
  ["peneiras", "/peneiras"],
  ["ranking", "/ranking"],
  ["dashboard", "/dashboard"],
  ["design-system", "/design-system"],
];
const BREAKPOINTS = [375, 768, 1280];

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

for (const [nome, rota] of TELAS) {
  for (const w of BREAKPOINTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: w,
      height: w === 375 ? 812 : w === 768 ? 1024 : 800,
      deviceScaleFactor: 1,
      isMobile: w === 375,
      hasTouch: w === 375,
    });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluateOnNewDocument((t) => {
      localStorage.setItem("png-theme", t);
      localStorage.setItem("png-cookie-consent", "aceito");
    }, theme);
    await page.goto(base + rota, { waitUntil: "networkidle0", timeout: 45000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    const r = await page.evaluate((largura) => {
      const de = document.documentElement;
      const fora = [...document.querySelectorAll("body *")]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return (
            b.width > 0 &&
            b.right > de.clientWidth + 1 &&
            cs.position !== "fixed" &&
            !e.closest("[aria-hidden='true'], .marquee-track, [data-radix-popper-content-wrapper]")
          );
        })
        .slice(0, 5)
        .map(
          (e) =>
            `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 50)} dir=${Math.round(e.getBoundingClientRect().right)}`,
        );
      const pequenos =
        largura < 500
          ? [
              ...document.querySelectorAll(
                "a,button,input,select,textarea,[role=tab],[role=button]",
              ),
            ]
              .filter((e) => {
                const b = e.getBoundingClientRect();
                const cs = getComputedStyle(e);
                if (
                  !b.width ||
                  !b.height ||
                  cs.visibility === "hidden" ||
                  e.classList.contains("skip-link")
                )
                  return false;
                if (e.tagName === "A" && cs.display === "inline") return false; // links no meio de texto (WCAG 2.5.8 exceção)
                if (e.type === "checkbox" || e.type === "radio") return false;
                return b.height < 44 || b.width < 44;
              })
              .map(
                (e) =>
                  `${e.tagName.toLowerCase()}:"${(e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 28)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`,
              )
          : [];
      return {
        path: location.pathname,
        sw: de.scrollWidth,
        cw: de.clientWidth,
        h1: document.querySelectorAll("h1").length,
        fora,
        pequenos,
      };
    }, w);
    const lateral = r.sw > r.cw ? `SCROLL LATERAL (${r.sw}>${r.cw})` : "ok";
    console.log(
      `${nome.padEnd(14)} ${String(w).padStart(4)}px -> ${r.path} | lateral: ${lateral} | h1=${r.h1} | fora=${r.fora.length} | alvos<44=${r.pequenos.length}`,
    );
    r.fora.forEach((f) => console.log("   fora:", f));
    r.pequenos.slice(0, 10).forEach((p) => console.log("   alvo:", p));
    if (r.path !== rota)
      console.log(`   (redirecionou para ${r.path}: tela exige login; print não gravado)`);
    if (prints && r.path === rota) {
      const sufixo = theme === "light" ? "-claro" : "";
      if (nome === "design-system") {
        // Página longa demais para um print único: um print por seção/bloco.
        // Barra de âncoras fixa e skip-link saem do print de elemento (só atrapalham a captura).
        await page.addStyleTag({
          content:
            'nav[aria-label="Seções do design system"]{position:static!important}.skip-link{display:none!important}',
        });
        const ids = await page.$$eval(
          "#tokens, #tipografia, #padroes, #estados, [id^='cmp-']",
          (els) => els.map((e) => e.id),
        );
        for (const id of ids) {
          const el = await page.$(`#${id}`);
          await el.screenshot({ path: `${OUT}/${nome}-${id}-${w}${sufixo}.png` });
        }
      } else {
        await page.screenshot({ path: `${OUT}/${nome}-${w}${sufixo}.png`, fullPage: true });
      }
    }
    await page.close();
  }
}
await browser.close();
