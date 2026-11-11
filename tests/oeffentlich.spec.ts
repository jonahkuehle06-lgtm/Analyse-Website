import { expect, test } from "@playwright/test";

const SEITEN = [
  "/", "/analysen", "/preise", "/methodik", "/ueber-uns", "/so-arbeiten-wir", "/hilfe",
  "/beispielanalyse", "/rechner", "/rechner/szenario", "/rechner/dcf", "/rechner/fairer-wert",
  "/agb", "/widerruf", "/impressum", "/datenschutz", "/haftungsausschluss", "/cookies",
  "/login", "/kuendigen", "/widerrufen",
];

for (const pfad of SEITEN) {
  test(`öffentliche Seite ${pfad} ist in Ordnung`, async ({ page, baseURL }) => {
    const fehler: string[] = [];
    const eigener = new URL(baseURL as string).origin;
    page.on("pageerror", (e) => fehler.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const ort = m.location().url;
      // Fehlgeschlagene Anfragen an fremde Hosts sind kein Fehler der Seite
      if (ort && !ort.startsWith(eigener)) return;
      fehler.push(`console: ${m.text()}`);
    });

    const antwort = await page.goto(pfad);
    expect(antwort?.status()).toBe(200);
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.title()).trim()).not.toBe("");

    const ueberlauf = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(ueberlauf, "horizontaler Überlauf").toBeLessThanOrEqual(1);

    expect(fehler).toEqual([]);
  });
}
