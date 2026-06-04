import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test('should navigate and submit forgot password form', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Click the forgot password button
    await page.click('text="Esqueci a senha"');
    
    // Verify that the URL changes to /forgot-password
    await expect(page).toHaveURL('http://localhost:3000/forgot-password');

    // Mock the backend response for forgot-password
    await page.route('**/authentication/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' }),
      });
    });

    // Fill the email input
    await page.fill('input[id="email"]', 'test@example.com');
    
    // Submit the form
    await page.click('button[type="submit"]');

    // Verify success message appears
    await expect(page.locator('text=Se o e-mail estiver cadastrado')).toBeVisible();
    
    // Verify link to go back
    await expect(page.locator('text="Voltar para o Login"').first()).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    
    // Fill invalid email
    await page.fill('input[id="email"]', 'invalid-email');
    
    // Submit the form
    await page.click('button[type="submit"]');

    // Verify error message from zod
    await expect(page.locator('text=E-mail inválido')).toBeVisible();
  });
});
