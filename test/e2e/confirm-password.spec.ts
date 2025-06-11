import { test, expect } from "@playwright/test";

test.describe("Confirm Password Feature", () => {
  test("should show confirm password field on registration page", async ({ page }) => {
    await page.goto("/register");
    
    // Check that confirm password field exists
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('label:has-text("パスワード（確認）")')).toBeVisible();
  });

  test("should show validation error when passwords don't match", async ({ page }) => {
    await page.goto("/register");
    
    // Fill form with mismatched passwords
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "differentpassword");
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible();
  });

  test("should allow registration when passwords match", async ({ page }) => {
    await page.goto("/register");
    
    // Fill form with matching passwords
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to home page or show success
    await page.waitForURL("/", { timeout: 10000 });
  });
});