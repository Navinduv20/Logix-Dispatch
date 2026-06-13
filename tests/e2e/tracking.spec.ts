import { test, expect } from '@playwright/test';

test.describe('Customer-facing tracking flow', () => {
  test('home page shows hero and navigates to a tracked shipment', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/real-time logistics/i);

    const input = page.getByPlaceholder(/enter tracking number/i);
    await input.fill('LGX-100001');
    await page.getByRole('button', { name: /track shipment/i }).click();

    await expect(page).toHaveURL(/\/track\/LGX-100001/);
    await expect(page.getByText('LGX-100001')).toBeVisible();
    await expect(page.getByText(/delivery history/i)).toBeVisible();
  });

  test('dispatcher console lists shipments and drivers', async ({ page }) => {
    await page.goto('/dispatcher');
    await expect(page.getByRole('heading', { name: /dispatcher console/i })).toBeVisible();
    await expect(page.getByText(/Nuwan Bandara/)).toBeVisible();
  });

  test('driver page shows the route for the selected driver', async ({ page }) => {
    await page.goto('/driver/d1');
    await expect(page.getByText(/Today's route/i)).toBeVisible();
    await expect(page.getByText(/Nuwan Bandara/)).toBeVisible();
  });
});
