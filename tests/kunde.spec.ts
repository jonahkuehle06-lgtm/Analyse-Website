import { expect, test } from "@playwright/test";
import { alsKundeAnmelden, OHNE_KUNDE_IN_CI } from "./hilfen";

test.skip(!!process.env.CI, OHNE_KUNDE_IN_CI);

test.beforeEach(async ({ page }) => {
  await alsKundeAnmelden(page);
});

test("Kunde sieht auf /analysen Karten", async ({ page }) => {
  await page.goto("/analysen");
  const karten = page.locator('a[href^="/analysen/"]:not([href="/analysen/historisch"])');
  expect(await karten.count()).toBeGreaterThan(0);
});

test("Suche ohne Treffer zeigt Hinweis", async ({ page }) => {
  await page.goto("/analysen?q=zzzz");
  await expect(page.getByText("Keine Analyse passt zu")).toBeVisible();
});

test("Listenansicht zeigt eine Tabelle", async ({ page }) => {
  await page.goto("/analysen?ansicht=liste");
  await expect(page.locator("table").first()).toBeVisible();
});

test("Eine Analyse öffnet sich mit Signalstärke und Szenarien", async ({ page }) => {
  await page.goto("/analysen");
  const karte = page.locator('a[href^="/analysen/"]:not([href="/analysen/historisch"])').first();
  await karte.click();
  await expect(page).toHaveURL(/\/analysen\/[^/]+$/);
  await expect(page.getByText("Signalstärke").first()).toBeVisible();
  await expect(page.getByText("Szenarien").first()).toBeVisible();
});
