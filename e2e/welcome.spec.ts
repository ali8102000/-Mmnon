import { test, expect } from "@playwright/test";

test("first visit shows welcome, completion opens auth and persists", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.getByRole("button", { name: "التالي", exact: true }).click();
  await page.getByRole("button", { name: "التالي", exact: true }).click();
  await page.getByRole("button", { name: "يلا نبدأ", exact: true }).click();
  await expect(page).toHaveURL(/\/auth$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mumnun-welcome-v1") || "null").completed)).toBe(true);
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth$/);
});

test("English choice persists and sign-in shortcut opens login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\?mode=login$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mumnun-welcome-v1") || "null").language)).toBe("en");
  await page.reload();
  await expect(page).toHaveURL(/\/auth\?mode=login$/);
});

test("skip opens auth without requiring all steps", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.getByRole("button", { name: "تخطي", exact: true }).click();
  await expect(page).toHaveURL(/\/auth$/);
});

test("legacy preview index opens the working first-visit screen", async ({ page }) => {
  await page.goto("/index");
  await expect(page).toHaveURL(/\/welcome$/);
});