import { expect, test } from "@playwright/test";

test("Navigates to login page and checks if main text is present", async ({ page }) => {
    await page.goto("/");
    await page.goto("/login");
    await page.reload();
    // Make sure that the 'WebClicker++' is present on screen
    await expect(page.getByText("Welcome to WebClicker++")).toBeVisible();
});
