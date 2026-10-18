import { expect, test, type CDPSession, type Page } from "@playwright/test";

/** Un balayage du doigt vers le haut (la page descend), piloté par le protocole de Chromium. */
async function swipe(page: Page, cdp: CDPSession, distance: number, durationMs: number) {
  const x = 195, y0 = 640;
  const stepsN = 6;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= stepsN; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - (distance * i) / stepsN }] });
    await page.waitForTimeout(durationMs / stepsN);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("Marcher sans rythme, au doigt", () => {
  test.skip(({ isMobile }) => !isMobile, "Le geste du doigt n'a de sens que sur le profil téléphone.");
  test("des balayages réguliers appellent le ver ; des balayages irréguliers l'éloignent", async ({ page }) => {
    await page.goto("/?monde=calme");
    await page.getByRole("button", { name: "Entrer en silence" }).click();
    await page.evaluate(() => {
      const el = document.getElementById("desert")!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.3, behavior: "instant" });
    });
    await page.waitForTimeout(500);
    const cdp = await page.context().newCDPSession(page);
    // Cadence régulière : des balayages identiques, un toutes les ≈ 520 ms (plus la latence du protocole), jusqu'à ce
    // que le ver approche — cinq balayages suffisent au compteur, sept le font approcher ; plafond à quatorze.
    let near = false;
    for (let i = 0; i < 14 && !near; i++) {
      await swipe(page, cdp, 120, 120);
      await page.waitForTimeout(400);
      near = (await page.locator("html").getAttribute("data-worm")) === "near";
    }
    expect(near, "le ver doit approcher après des balayages réguliers").toBe(true);
    // Pas irréguliers : amplitudes et pauses variées → le ver s'éloigne.
    const plan: [number, number][] = [[40, 60], [220, 700], [90, 150], [260, 900], [30, 80], [180, 500], [60, 1100]];
    for (const [d, w] of plan) {
      await swipe(page, cdp, d, 90);
      await page.waitForTimeout(w);
    }
    await expect(page.locator("html")).not.toHaveAttribute("data-worm", "near", { timeout: 8000 });
  });
});
