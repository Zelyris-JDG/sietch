import { expect, test } from "@playwright/test";

test.describe("Pages du refuge", () => {
  test("le lexique se cherche et se filtre (accents et casse indifférents)", async ({ page }) => {
    await page.goto("/lexique");
    const input = page.getByLabel("Chercher un mot");
    await input.fill("EPICE");
    await expect(page.locator("#epice")).toBeVisible();
    await expect(page.locator("#arrakeen")).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText(/^\d+ termes? affichés? sur 41$/); // le compteur différé (300 ms) doit refléter le filtre, pas le texte initial
    await input.fill("");
    const lieux = page.getByRole("button", { name: /^Lieux/ });
    await lieux.click();
    await expect(lieux).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#arrakeen")).toBeVisible();
    await expect(page.locator("#fremen")).toHaveCount(0);
    await input.fill("zzzz-rien");
    await expect(page.getByText("Aucun terme ne correspond")).toBeVisible();
  });

  test("une adresse inconnue répond 404 dans l'ambiance du site", async ({ page }) => {
    const r = await page.goto("/nulle-part");
    expect(r?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/le sable a tout recouvert/i);
    await expect(page.getByText("Carnets du Sietch")).toBeAttached();
    await expect(page.getByRole("link", { name: "Revenir à la descente" })).toHaveAttribute("href", "/");
  });
});
