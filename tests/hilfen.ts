import { expect, type Page } from "@playwright/test";

/* Zugangsdaten: lokal die Testkonten aus data/store.local.json, in CI nur der
   Admin aus dem Workflow (ADMIN_PASSWORD_HASH zu diesem Test-Passwort). */
export const KUNDE = { email: "test@example.com", passwort: "Testpasswort123" };
export const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@example.com",
  passwort: process.env.TEST_ADMIN_PASSWORD ?? (process.env.CI ? "CiTestpasswort123" : "Adminpasswort123"),
};

export const OHNE_KUNDE_IN_CI = "In CI gibt es keinen Testkunden: data/seed.json enthält keine Nutzer.";

export async function anmelden(page: Page, zugang: { email: string; passwort: string }, pfad = "/login") {
  await page.goto(pfad);
  await page.getByLabel("E-Mail-Adresse").fill(zugang.email);
  await page.getByLabel("Passwort").fill(zugang.passwort);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

export async function alsKundeAnmelden(page: Page) {
  await anmelden(page, KUNDE);
  await expect(page).toHaveURL(/\/analysen/);
}

export async function alsAdminAnmelden(page: Page) {
  await anmelden(page, ADMIN, "/admin/login");
  await expect(page).toHaveURL(/\/admin(?!\/login)/);
}

/** ID und Begründung der ersten Analyse aus dem Adminbereich. */
export async function ersteAnalyse(page: Page): Promise<{ id: string; begruendung: string }> {
  await alsAdminAnmelden(page);
  const href = await page.locator('a[href^="/admin/"]:not([href="/admin/neu"]):not([href="/admin/warteliste"])').first().getAttribute("href");
  const id = href?.split("/").pop();
  expect(id, "Im Adminbereich muss mindestens eine Analyse stehen").toBeTruthy();
  await page.goto(`/admin/${id}`);
  const begruendung = await page.locator('textarea[name="reason"]').inputValue();
  expect(begruendung.length).toBeGreaterThan(20);
  return { id: id as string, begruendung };
}
