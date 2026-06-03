import { test, expect } from '@playwright/test';

test.describe('Gestão de Contratos SaaS E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/authentication/me', async route => {
      await route.fulfill({ status: 200, json: { id: '1', name: 'Mock User', role: 'ADMIN' } });
    });
    await page.route('**/api/authentication/me/tenants', async route => {
      await route.fulfill({ status: 200, json: [{ tenantId: 'mock-tenant-id', name: 'Tenant Mock' }] });
    });
    
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.setItem('gestao_tenant_id', 'mock-tenant-id');
      localStorage.setItem('gestao_token', 'mock-token');
    });
  });

  test('Dashboard loads correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Lefer SaaS/);
    
    // Expect the Sidebar to contain 'Dashboard' and 'Clientes'
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Clientes')).toBeVisible();
  });

  test('Customer Creation flow UI', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click on 'Clientes' menu
    await page.click('text=Clientes');
    
    // Check if we are on the customers page
    await expect(page.locator('h1').filter({ hasText: 'Clientes' })).toBeVisible();
    
    // Click on 'Novo Cliente' button
    await page.click('text=Novo Cliente');
    
    // Expect the Customer form to be visible
    await expect(page.locator('h1:has-text("Novo Cliente")')).toBeVisible();
    
    // Fill the basic data
    await page.fill('input[name="document"]', '12345678901234');
    await page.fill('input[name="corporateName"]', 'Playwright Test Ltda');
    
    // Add a contact
    await page.click('text=Adicionar Contato');
    await page.fill('input[name="contacts.0.name"]', 'John Doe');
    await page.fill('input[name="contacts.0.email"]', 'john@playwright.dev');

    // We stop before submitting to avoid bloating the test DB.
    // The UI interaction itself validates that the form components are working.
  });
});
