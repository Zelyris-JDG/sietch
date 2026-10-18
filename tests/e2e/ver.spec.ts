import { expect, test } from "@playwright/test";

test.describe("Marcher sans rythme", () => {
  test.skip(({ isMobile }) => !!isMobile, "Sur téléphone, la cadence vient du doigt (touchmove) ; la molette simulée n’a pas de sens.");
  test("un défilement régulier sur le sable appelle le ver ; un défilement irrégulier l'éloigne", async ({ page }) => {
    await page.goto("/?monde=calme"); // la mécanique ne dépend pas du WebGL ; le rendu logiciel ralentirait la cadence
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    // Se placer au début du désert.
    await page.evaluate(() => {
      const el = document.getElementById("desert")!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.4, behavior: "instant" });
    });
    await page.waitForTimeout(600);
    await page.mouse.move(600, 400);
    // Cadence parfaitement régulière : 28 crans identiques toutes les 90 ms.
    for (let i = 0; i < 28; i++) {
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(90);
    }
    await expect(page.locator("html")).toHaveAttribute("data-worm", "near", { timeout: 4000 });
    await expect(page.locator(".toast[data-open='true']")).toBeVisible({ timeout: 4000 });
    await expect(page.locator(".toast")).toContainText("Marchez sans rythme");
    // Pas irréguliers : le ver s'éloigne.
    const waits = [30, 260, 70, 420, 110, 330, 40, 500, 90, 280];
    for (const w of waits) {
      await page.mouse.wheel(0, 10 + Math.round(Math.random() * 90));
      await page.waitForTimeout(w);
    }
    await expect(page.locator("html")).not.toHaveAttribute("data-worm", "near", { timeout: 6000 });
  });
});
