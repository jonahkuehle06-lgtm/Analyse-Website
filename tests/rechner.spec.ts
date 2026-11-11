import { expect, test } from "@playwright/test";

test("Szenario-Rechner zeigt mit Startwerten den Erwartungswert 104", async ({ page }) => {
  await page.goto("/rechner/szenario");
  await expect(page.getByText("Erwartungswert").first()).toBeVisible();
  await expect(page.locator("dl").filter({ hasText: "Erwartungswert" })).toContainText("104");
});

test("Szenario-Rechner rechnet nach Änderung des Kurses neu", async ({ page }) => {
  await page.goto("/rechner/szenario");
  await page.getByLabel("Kursziel A").fill("150");
  // 150*0,25 + 108*0,5 + 70*0,25 = 109
  await expect(page.locator("dl").filter({ hasText: "Erwartungswert" })).toContainText("109");
});

test("DCF-Rechner zeigt mit Startwerten 36,05", async ({ page }) => {
  await page.goto("/rechner/dcf");
  await expect(page.getByText("36,05").first()).toBeVisible();
});

test("Rechner „Fairer Wert“ rechnet nach Eingabe um", async ({ page }) => {
  await page.goto("/rechner/fairer-wert");
  await page.getByLabel("Geschätzter fairer Wert je Aktie").fill("200");
  await page.getByLabel("Aktueller Kurs").fill("100");
  await page.getByLabel("Gewünschte Sicherheitsmarge").fill("20");
  const ergebnis = page.locator("dl").filter({ hasText: "Kaufkurs bei gewünschter Marge" });
  await expect(ergebnis).toContainText("160,00 €");
  await expect(ergebnis).toContainText("+50");
});
