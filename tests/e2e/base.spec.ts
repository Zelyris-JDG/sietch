import { expect, test } from "@playwright/test";

test.describe("Sietch — tests de base", () => {
  test("la page charge, le titre et les scènes sont là", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sietch/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/refuge des fans/i);
    for (const id of ["orbite", "entree", "desert", "epice", "maisons", "sietch", "prescience"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("le son est désactivé par défaut", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    const btn = page.getByRole("button", { name: /Son coupé : activer|Son : couper/ });
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    await expect(btn).toHaveAccessibleName("Son coupé : activer");
    const stored = await page.evaluate(() => localStorage.getItem("sietch-son"));
    expect(stored).toBeNull();
  });

  test("les liens officiels du Sietch sont présents et s'ouvrent dans un nouvel onglet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    const steam = page.locator('a[href="https://store.steampowered.com/app/1172710/"]').first();
    await expect(steam).toHaveAttribute("target", "_blank");
    await expect(steam).toHaveAttribute("rel", /noopener/);
    await expect(page.locator('a[href="https://duneawakening.com"]').first()).toBeAttached();
    await expect(page.locator('a[href="https://zelyris.fr"]').first()).toBeAttached();
    await expect(page.locator('a[href="/mentions-legales"]').first()).toBeAttached();
    await expect(page.getByText("Site de fan non officiel", { exact: false }).first()).toBeAttached();
  });

  test("le mode réduit garde une page complète et statique", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
    await expect(page.locator(".still-world")).toHaveCount(1);
    await expect(page.locator("#world canvas")).toHaveCount(0);
    await expect(page.locator("#desert")).toBeAttached();
    const sticky = await page.locator("#entree .scene__sticky").evaluate((el) => getComputedStyle(el).position);
    expect(sticky).toBe("relative");
  });

  test("les pages Lexique et Mentions légales répondent", async ({ page }) => {
    const r1 = await page.goto("/lexique");
    expect(r1?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/mots du sable/i);
    const r2 = await page.goto("/mentions-legales");
    expect(r2?.status()).toBe(200);
    await expect(page.getByText("Johan De Grave").first()).toBeAttached();
    await expect(page.getByText("Vercel Inc.").first()).toBeAttached();
  });

  test("la prescience pose un voile bleu et se retire", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    await page.locator("#prescience").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Prendre l’épice" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-prescience", "on");
    await page.getByRole("button", { name: "Revenir au présent" }).first().click();
    await expect(page.locator("html")).not.toHaveAttribute("data-prescience", "on");
  });

  test("l'en-tête noindex est posé (préversion)", async ({ request }) => {
    const r = await request.get("/");
    expect(r.headers()["x-robots-tag"]).toContain("noindex");
  });
});
