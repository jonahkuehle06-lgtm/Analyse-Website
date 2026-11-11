import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const pfad of ["/", "/preise", "/analysen", "/rechner/dcf", "/beispielanalyse"]) {
  test(`${pfad} hat keine schweren Barrierefreiheits-Verstöße`, async ({ page }) => {
    // Ohne Bewegung messen: mitten im Einblenden wäre der Kontrast kurz zu gering
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pfad);
    await page.waitForLoadState("networkidle").catch(() => {});
    // Abschnitte unterhalb des Bildschirms rendert der Browser erst beim Scrollen
    // (content-visibility: auto). axe läse dort Standardfarben statt der echten -
    // deshalb für die Messung alles rendern lassen.
    await page.addStyleTag({ content: ".cv-auto { content-visibility: visible !important; }" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const ergebnis = await new AxeBuilder({ page }).analyze();
    const schwer = ergebnis.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      schwer.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`),
    ).toEqual([]);
  });
}
