import { test, expect } from '@playwright/test';

test.describe('CRM Leads Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('response', response => {
      if (response.status() === 401) {
        console.log(`[401] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.route('**/api/authentication/me', async route => {
      await route.fulfill({ status: 200, json: { id: '1', name: 'Mock User', role: 'ADMIN' } });
    });
    await page.route('**/api/authentication/me/tenants', async route => {
      await route.fulfill({ status: 200, json: [{ tenantId: 'mock-tenant-id', name: 'Tenant Mock' }] });
    });
    await page.route('**/api/tenant-settings', async route => {
      await route.fulfill({ status: 200, json: { 
        primaryColor: '#000000',
        needsMappingConfig: [
          { id: '123', label: 'Sistema Atual', type: 'text' },
          { id: '456', label: 'Possui filiais?', type: 'textarea' }
        ]
      } });
    });
    await page.route('**/api/authentication/me/permissions', async route => {
      await route.fulfill({ status: 200, json: { role: 'ADMIN', roleId: '1', permissions: ['crm:manage', 'crm:read', 'crm:view'], maxDiscount: 10 } });
    });
    await page.route('**/api/dashboard/**', async route => {
      await route.fulfill({ status: 200, json: {} });
    });
    
    // Navigate to a 404 page to set localStorage without triggering login redirects
    await page.goto('http://localhost:3000/dummy-for-testing');
    await page.evaluate(() => {
      localStorage.setItem('gestao_tenant_id', 'mock-tenant-id');
      localStorage.setItem('gestao_token', 'mock-token');
    });

    await page.goto('http://localhost:3000/crm/leads/new');
  });

  test('should render new lead page correctly with dynamic mapping', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Novo Lead' })).toBeVisible();
    await expect(page.getByLabel('Razão Social / Nome da Empresa *')).toBeVisible();
    await expect(page.getByLabel('CPF / CNPJ')).toBeVisible();
    await expect(page.getByLabel('WhatsApp')).toBeVisible();

    // Dynamic fields mapping
    await expect(page.getByLabel('Sistema Atual')).toBeVisible();
    await expect(page.getByLabel('Possui filiais?')).toBeVisible();
  });

  test('should format document (CPF/CNPJ) with react-imask', async ({ page }) => {
    const documentInput = page.getByLabel('CPF / CNPJ');
    
    // Type a CPF
    await documentInput.fill('12345678901');
    await expect(documentInput).toHaveValue('123.456.789-01');

    // Type a CNPJ
    await documentInput.fill('12345678000199');
    await expect(documentInput).toHaveValue('12.345.678/0001-99');
  });

  test('should format WhatsApp correctly', async ({ page }) => {
    const whatsappInput = page.getByLabel('WhatsApp');
    
    // Type 10 digits
    await whatsappInput.fill('1140028922');
    await expect(whatsappInput).toHaveValue('(11) 4002-8922');

    // Type 11 digits
    await whatsappInput.fill('11987654321');
    await expect(whatsappInput).toHaveValue('(11) 98765-4321');
  });

  test('should display validation error for required fields', async ({ page }) => {
    // Attempt to save without filling anything
    const saveButton = page.getByRole('button', { name: 'Salvar Lead' });
    await saveButton.click();

    // Check for validation message
    await expect(page.locator('text=Razão Social é obrigatória').first()).toBeVisible();
  });
});
