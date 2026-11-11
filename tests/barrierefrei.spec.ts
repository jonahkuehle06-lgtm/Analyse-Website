import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Die Kontrastmessung von axe schwankt selten bei überlagerten Ebenen
// (Wasserzeichen, Kopfzeile) - ein zweiter Versuch trennt das von echten Funden.
test.describe.configure({ retries: 2 });

for (const pfad of ["/", "/preise", "/analysen", "/rechner/dcf", "/beispielanalyse"]) {
  test(`${pfad} hat keine schweren Barrierefreiheits-Verstöße`, async ({ page }) => {
    // Ohne Bewegung messen: mitten im Einblenden wäre der Kontrast kurz zu gering
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pfad);
    await page.waitForLoadState("networkidle").catch(() => {});
    // Schriften und Einblendungen abwarten - sonst misst axe Farben im Übergang
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    const ergebnis = await new AxeBuilder({ page }).analyze();
    const schwer = ergebnis.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      schwer.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`),
    ).toEqual([]);
  });
}
