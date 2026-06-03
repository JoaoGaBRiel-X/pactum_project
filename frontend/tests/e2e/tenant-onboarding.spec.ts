import { test, expect } from '@playwright/test';

test.describe('Tenant Onboarding Flow', () => {
  test('Should create a new tenant and its schema', async ({ page }) => {
    // 0. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'e2e-test@lefer.com.br');
    await page.fill('input[type="password"]', 'PasswordE2E@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // 1. Navigate to admin tenants page
    await page.goto('http://localhost:3000/admin/tenants');
    await expect(page.getByRole('heading', { name: 'Locatários (Tenants)' })).toBeVisible({ timeout: 10000 });

    // 2. Click new tenant
    await page.getByRole('button', { name: /Novo Tenant/i }).click();

    // 3. Fill the form
    const uniqueCnpj = `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}/0001-${Math.floor(Math.random() * 90 + 10)}`;
    const tenantName = 'Empresa Automação ' + Date.now();

    await page.getByPlaceholder('Nome da empresa locatária').fill(tenantName);
    await page.getByPlaceholder('00.000.000/0000-00').fill(uniqueCnpj);
    await page.getByPlaceholder('Ex: João da Silva').fill('João Automator');
    await page.getByPlaceholder('admin@empresa.com.br').fill(`admin+${Date.now()}@teste.com`);

    // 4. Submit and wait for success
    page.on('dialog', async dialog => {
      try {
        await dialog.accept();
      } catch (e) {}
    });

    await page.getByRole('button', { name: /Salvar Locatário/i }).click();

    // 5. It should redirect back to list and show the new tenant
    // Note: the backend db push might take 5-15 seconds.
    await expect(page.getByText(tenantName)).toBeVisible({ timeout: 30000 });
  });
});
