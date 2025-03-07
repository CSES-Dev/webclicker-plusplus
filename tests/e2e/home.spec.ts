import { expect, test } from "@playwright/test";

test("Navigates to home page and checks if main text is present", async ({ page }) => {
    await page.goto("/login");
    // Make sure that the 'WebClicker++' is present on screen
    await expect(page.getByText("Welcome to WebClicker++")).toBeVisible();
});
