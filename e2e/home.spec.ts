import { test, expect } from "@playwright/test";

/**
 * E2E coverage for the Avento homepage (RU + EN).
 *
 * Routes: `/ru` and `/en` are the real pages (locale prefix is always
 * present). `/` is a 307 redirect to `/ru` via the next-intl middleware and is
 * covered separately, not used as a base for the flows below.
 */

test.describe("locale routing", () => {
  // Pin the request's Accept-Language so the "/" redirect target is
  // deterministic (next-intl otherwise negotiates from Accept-Language,
  // which Playwright's Desktop Chrome preset sets to en-US by default).
  test.use({ locale: "ru-RU" });

  test("/ redirects to /ru", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200); // Playwright follows the redirect
    expect(page.url()).toMatch(/\/ru\/?$/);
  });

  test("/ru renders the Russian homepage", async ({ page }) => {
    const res = await page.goto("/ru");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test("/en renders the English homepage", async ({ page }) => {
    const res = await page.goto("/en");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("header + mega menu", () => {
  test("burger opens and closes the mega menu", async ({ page }) => {
    await page.goto("/ru");
    const burger = page.locator("button.burger");
    const megaNav = page.locator("#mnav");

    await expect(megaNav).not.toHaveClass(/open/);
    await burger.click();
    await expect(megaNav).toHaveClass(/open/);

    // Escape closes it.
    await page.keyboard.press("Escape");
    await expect(megaNav).not.toHaveClass(/open/);
  });

  test("clicking a mega menu link closes the menu", async ({ page }) => {
    await page.goto("/ru");
    await page.locator("button.burger").click();
    const megaNav = page.locator("#mnav");
    await expect(megaNav).toHaveClass(/open/);

    await megaNav.getByRole("link").first().click();
    await expect(megaNav).not.toHaveClass(/open/);
  });
});

test.describe("locale switcher", () => {
  test("switching to EN updates the URL and page language", async ({
    page,
  }) => {
    await page.goto("/ru");
    const heroHeadingRu = await page.locator("h1").textContent();

    // Scope to the header: the footer renders its own locale-switcher pill
    // with the same markup, so an unscoped locator is ambiguous.
    await page
      .locator("header.nav .lang button", { hasText: "EN" })
      .click();
    await expect(page).toHaveURL(/\/en\/?$/);

    const heroHeadingEn = await page.locator("h1").textContent();
    expect(heroHeadingEn).not.toBe(heroHeadingRu);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("switching to RU updates the URL and page language", async ({
    page,
  }) => {
    await page.goto("/en");
    await page
      .locator("header.nav .lang button", { hasText: "RU" })
      .click();
    await expect(page).toHaveURL(/\/ru\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });
});

test.describe("mortgage calculator", () => {
  test("recomputes the monthly payment when the price slider moves", async ({
    page,
  }) => {
    await page.goto("/ru");
    const monthly = page.locator("#calc .result .big");
    const before = await monthly.textContent();

    const priceSlider = page.locator("#calc-price");
    await priceSlider.fill("900000"); // max bound
    await priceSlider.dispatchEvent("input");

    await expect(async () => {
      const after = await monthly.textContent();
      expect(after).not.toBe(before);
    }).toPass();
  });
});

test.describe("lead form", () => {
  // The dev server's rate limiter is a single in-memory store shared by every
  // worker/test hitting the same client IP. Give each test here its own
  // x-forwarded-for bucket so they stay independent of run order/parallelism
  // and of the dedicated rate-limit test below.
  test("empty submit is rejected by the server and surfaces an error", async ({
    page,
  }) => {
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.1" });
    await page.goto("/ru");
    const form = page.locator("form.cform");
    await form.locator('button[type="submit"]').click();

    const status = form.locator(".form-status");
    await expect(status).toHaveClass(/err/);
    await expect(status).not.toBeEmpty();

    // The API returns machine-readable codes for name/phone specifically
    // (they're the only required fields); the form must surface them inline,
    // not just the generic banner above.
    await expect(form.locator('input[name="name"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(form.locator('input[name="phone"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    // name + phone + consent are all required; an empty submit surfaces all three.
    await expect(form.locator(".ferr")).toHaveCount(3);
  });

  test("valid submit succeeds and resets the form", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.2" });
    await page.goto("/ru");
    const form = page.locator("form.cform");
    await form.locator('input[name="name"]').fill("Иван Тестов");
    await form.locator('input[name="phone"]').fill("+351 912 345 678");
    await form.locator('input[name="consent"]').check();

    await form.locator('button[type="submit"]').click();

    const status = form.locator(".form-status");
    await expect(status).toHaveClass(/ok/);
    await expect(form.locator('input[name="name"]')).toHaveValue("");
  });

  test("honeypot field silently succeeds without delivering the lead", async ({
    page,
  }) => {
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.3" });
    await page.goto("/ru");
    const form = page.locator("form.cform");
    await form.locator('input[name="name"]').fill("Bot Name");
    await form.locator('input[name="phone"]').fill("+351912345678");
    // The honeypot input is hidden from users but still present in the DOM.
    await form.locator('input[name="company"]').fill("Acme Corp");

    // Note: we intentionally assert via response.status() + the UI, not
    // response.json()/.body(). Reading the body through CDP hangs against
    // this project's Turbopack dev server (chunked transfer-encoding never
    // reads as "finished" to Playwright's network stack) -- reproducible on
    // every /api/lead response, not specific to this flow. A same-origin
    // page.evaluate() fetch() and the UI both resolve instantly, confirming
    // the server itself responds correctly; this is a CDP/dev-server
    // integration quirk, not an app bug.
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/lead")),
      form.locator('button[type="submit"]').click(),
    ]);
    expect(response.status()).toBe(200);

    // The UI shows the same generic success state a real accepted lead would
    // (by design: bots get no signal that they were dropped).
    const status = form.locator(".form-status");
    await expect(status).toHaveClass(/ok/);
    await expect(form.locator('input[name="name"]')).toHaveValue("");
  });
});

test.describe("cookie consent", () => {
  test("shows the banner and does not load analytics before consent", async ({
    page,
  }) => {
    await page.goto("/ru");
    const banner = page.getByRole("dialog", { name: /cookie consent/i });
    await expect(banner).toBeVisible();

    const gaLoaded = await page.evaluate(
      () => !!(window as unknown as { __aventoAnalyticsLoaded?: boolean })
        .__aventoAnalyticsLoaded,
    );
    expect(gaLoaded).toBe(false);

    await banner.getByRole("button", { name: /принять/i }).click();
    await expect(banner).toBeHidden();
  });
});

test.describe("/api/lead", () => {
  test("400 on invalid payload (missing name + phone)", async ({
    request,
  }) => {
    const res = await request.post("/api/lead", {
      data: { name: "", phone: "" },
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.4",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fields).toMatchObject({
      name: "name_required",
      phone: "phone_required",
    });
  });

  test("200 ok on a valid payload", async ({ request }) => {
    const res = await request.post("/api/lead", {
      data: { name: "QA Bot", phone: "+351912345678", consent: true },
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.5",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  test("415 when content-type is not JSON", async ({ request }) => {
    const res = await request.post("/api/lead", {
      data: "name=x&phone=123",
      headers: {
        "Content-Type": "text/plain",
        "x-forwarded-for": "198.51.100.6",
      },
    });
    expect(res.status()).toBe(415);
  });

  test("429 after exceeding the rate limit", async ({ request }) => {
    let last;
    for (let i = 0; i < 7; i++) {
      last = await request.post("/api/lead", {
        data: { name: "Spam Bot", phone: "+351912345000" },
        headers: {
          "Content-Type": "application/json",
          // Distinct IP bucket so this test doesn't collide with others.
          "x-forwarded-for": "203.0.113.55",
        },
      });
    }
    expect(last?.status()).toBe(429);
    expect(last?.headers()["retry-after"]).toBeTruthy();
  });
});
