// Auditoria axe-core (WCAG 2.1 A/AA) + console. Uso: node scripts/axe-audit.mjs <baseUrl> <rota...>
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";

const [base, ...routes] = process.argv.slice(2);
const axeSrc = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
for (const route of routes) {
  for (const scheme of ["light", "dark"]) {
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
    const logs = [];
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`${m.type()}: ${m.text().slice(0, 140)}`));
    page.on("pageerror", (e) => logs.push(`pageerror: ${e.message.slice(0, 140)}`));
    page.on("response", (r) => r.status() >= 400 && logs.push(`HTTP ${r.status()} ${r.url().slice(0, 100)}`));
    await page.goto(base + route, { waitUntil: "networkidle0", timeout: 45000 }).catch(() => {});
    await page.evaluate(axeSrc);
    const res = await page.evaluate(() =>
      axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }),
    );
    console.log(`\n## ${route} [${scheme}] violações=${res.violations.length} console=${logs.length}`);
    for (const v of res.violations)
      console.log(`- ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" ; ")}`);
    [...new Set(logs)].slice(0, 6).forEach((l) => console.log("  ·", l));
    await page.close();
  }
}
await browser.close();
