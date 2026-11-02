import { test, expect } from "@playwright/test";

/**
 * E2E: valid phone + OTP/password submission must always navigate the user
 * away from /auth to their next page (/select-role for a brand-new user,
 * /home for an existing user with a role).
 *
 * The current app uses a phone + password flow as the OTP equivalent
 * (auto-confirm email is enabled, so a successful submit yields an
 * authenticated session immediately, same as a verified OTP).
 *
 * Set TEST_PHONE / TEST_PASSWORD to run against a seeded existing user.
 * Otherwise the test generates a fresh phone number and signs up.
 */

const EXISTING_PHONE = process.env.TEST_PHONE;
const EXISTING_PASSWORD = process.env.TEST_PASSWORD;

function randomIraqiPhone(): string {
  // +9647XXXXXXXXX — 10 digits after country code
  const n = Math.floor(100_000_000 + Math.random() * 899_999_999);
  return `07${n}`;
}

test.describe("Auth → next page", () => {
  test("new user: signup with valid phone + code → /select-role", async ({
    page,
  }) => {
    await page.goto("/auth");

    // Default mode is signup; ensure it.
    const signupTab = page.getByRole("button", { name: "حساب جديد" });
    await signupTab.click();

    const phone = randomIraqiPhone();
    const password = "123456"; // acts as the OTP code (≥6 chars enforced)

    await page.getByPlaceholder("مثال: أحمد محمد").fill("اختبار آلي");
    await page.getByPlaceholder("07XXXXXXXXX").fill(phone);
    await page.getByPlaceholder("••••••").fill(password);

    await page.getByRole("button", { name: /إنشاء الحساب/ }).click();

    // Must leave /auth and land on the next page (role picker for new users).
    await expect(page).toHaveURL(/\/select-role$/, { timeout: 20_000 });
  });

  test("existing user: login with valid phone + code → /home or /select-role", async ({
    page,
  }) => {
    test.skip(
      !EXISTING_PHONE || !EXISTING_PASSWORD,
      "Set TEST_PHONE and TEST_PASSWORD env vars to run the existing-user case.",
    );

    await page.goto("/auth");
    await page.getByRole("button", { name: "تسجيل دخول" }).click();

    await page.getByPlaceholder("07XXXXXXXXX").fill(EXISTING_PHONE!);
    await page.getByPlaceholder("••••••").fill(EXISTING_PASSWORD!);

    await page.getByRole("button", { name: /^دخول/ }).click();

    // index.tsx routes based on roles; either destination proves we left /auth.
    await page.waitForURL(/\/(home|select-role)$/, { timeout: 20_000 });
    expect(page.url()).not.toMatch(/\/auth$/);
  });
});
