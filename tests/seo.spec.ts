import { expect, test } from "@playwright/test";

test("robots.txt antwortet mit 200", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
});

test("Sitemap enthält Rechner, aber keine geschützten Bereiche", async ({ request }) => {
  const antwort = await request.get("/sitemap.xml");
  expect(antwort.status()).toBe(200);
  const orte = [...(await antwort.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(orte).toContain("/rechner/dcf");
  for (const verboten of ["/wissen", "/konto", "/admin"]) {
    expect(orte.filter((p) => p === verboten || p.startsWith(`${verboten}/`)), verboten).toEqual([]);
  }
});

for (const pfad of ["/analysen/historisch", "/konto"]) {
  test(`${pfad} trägt noindex`, async ({ page, request }) => {
    // /konto leitet Gäste um; noindex steht auf der Zielseite bzw. im Antwortkopf
    await page.goto(pfad);
    const meta = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(meta ?? "").toContain("noindex");
    void request;
  });
}

test("Startseite hat kanonische Adresse und gültiges JSON-LD", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBeTruthy();
  const skripte = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(skripte.length).toBeGreaterThan(0);
  for (const s of skripte) expect(() => JSON.parse(s)).not.toThrow();
});
