import { expect, test } from "@playwright/test";
import { ersteAnalyse } from "./hilfen";

test("Gast sieht auf /analysen keine Begründungen und nur gesperrte Karten", async ({ page, browser }) => {
  const admin = await browser.newContext();
  const { begruendung } = await ersteAnalyse(await admin.newPage());
  await admin.close();

  await page.goto("/analysen");
  await expect(page.getByText("Nicht im Paketumfang").first()).toBeVisible();
  const text = (await page.content()).replace(/\s+/g, " ");
  expect(text).not.toContain(begruendung.slice(0, 60).replace(/\s+/g, " "));
});

test("Gast wird von einer Analyse-Detailseite auf /preise geleitet", async ({ page, browser }) => {
  const admin = await browser.newContext();
  const { id } = await ersteAnalyse(await admin.newPage());
  await admin.close();

  await page.goto(`/analysen/${id}`);
  await expect(page).toHaveURL(/\/preise/);
});

test("/analysen/historisch zeigt Gästen „Gesperrt“", async ({ page }) => {
  await page.goto("/analysen/historisch");
  await expect(page.getByText("Gesperrt").first()).toBeVisible();
});

test("/konto leitet Gäste auf /login", async ({ page }) => {
  await page.goto("/konto");
  await expect(page).toHaveURL(/\/login/);
});

test("/admin leitet auf /admin/login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("/wissen liefert Gästen 404", async ({ request }) => {
  const antwort = await request.get("/wissen");
  expect(antwort.status()).toBe(404);
});

test("Wochenübersicht ohne Geheimnis liefert 401", async ({ request }) => {
  const antwort = await request.get("/api/cron/wochenuebersicht");
  expect(antwort.status()).toBe(401);
});
