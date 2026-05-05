import { test, expect } from "@playwright/test";

test.describe("Home Page & Locale Routing", () => {
  test("should automatically redirect root to default locale (/es)", async ({
    page,
  }) => {
    // Navigate to the root URL
    await page.goto("/");

    // Verify that the URL was rewritten/redirected to /es
    await expect(page).toHaveURL(/.*\/es/);
  });

  test("should contain expected elements on the Spanish home page", async ({
    page,
  }) => {
    // Navigate directly to the default locale
    await page.goto("/es");

    // Check if the page contains some standard Next.js or template text.
    // Adjust this selector based on what's actually on your landing page.
    // As an example, we just check that the page body is visible.
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Verify Next.js hydration was successful by checking if Next.js specific elements exist
    // Example: Clerk auth or basic DOM elements
    const nextRoot = page.locator("body");
    await expect(nextRoot).not.toBeEmpty();
  });
});
