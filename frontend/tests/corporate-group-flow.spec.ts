import { test, expect } from '@playwright/test';

test.describe('Corporate Group Management Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock global layout requests to prevent 401 redirect
    await page.route('**/api/authentication/me', async route => {
      await route.fulfill({ status: 200, json: { id: '1', name: 'Mock User', role: 'ADMIN' } });
    });
    
    await page.route('**/api/tenant-settings', async route => {
      await route.fulfill({ status: 200, json: { name: 'Tenant Mock', slug: 'mock' } });
    });
    
    await page.route('**/api/authentication/me/tenants', async route => {
      await route.fulfill({ status: 200, json: [{ tenantId: 'mock-tenant-id', name: 'Tenant Mock' }] });
    });

    // Inject auth mock
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.setItem('gestao_tenant_id', 'mock-tenant-id');
      localStorage.setItem('gestao_token', 'mock-token');
    });
  });

  test('Deve listar grupos econômicos e testar busca', async ({ page }) => {
    await page.route('**/api/corporate-groups', async route => {
      await route.fulfill({ status: 200, json: [
        { id: '1', name: 'GRUPO ALFA', isActive: true, customers: [] },
        { id: '2', name: 'GRUPO BETA', isActive: true, customers: [] }
      ] });
    });

    await page.goto('http://localhost:3000/corporate-groups');

    await expect(page.getByText('GRUPO ALFA')).toBeVisible();
    await expect(page.getByText('GRUPO BETA')).toBeVisible();

    // Search for GRUPO ALFA
    await page.getByPlaceholder('Buscar por nome...').fill('GRUPO ALFA');

    await expect(page.getByText('GRUPO ALFA')).toBeVisible();
    await expect(page.getByText('GRUPO BETA')).not.toBeVisible();
  });

  test('Deve validar campos obrigatórios na criação de grupo', async ({ page }) => {
    await page.goto('http://localhost:3000/corporate-groups/new');
    await expect(page.getByText('Novo Grupo Econômico')).toBeVisible();

    // Click Save without filling
    await page.getByRole('button', { name: 'Salvar Grupo' }).click();

    // Zod Validation errors should appear
    await expect(page.getByText('Nome do grupo é obrigatório')).toBeVisible();
  });

  test('Deve criar novo grupo econômico', async ({ page }) => {
    // Mock API for POST (Create) and GET (List)
    await page.route('**/api/corporate-groups', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 'new-group' } });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: [
          { id: 'new-group', name: 'GRUPO OMEGA', isActive: true, customers: [] }
        ] });
      } else {
        await route.continue();
      }
    });

    await page.goto('http://localhost:3000/corporate-groups/new');
    
    // Fill form
    await page.locator('input[name="name"]').fill('GRUPO OMEGA');
    await page.locator('input[name="description"]').fill('Grupo de empresas Omega');

    // Save
    await page.locator('button[type="submit"]').click();

    // Verify Redirect
    await expect(page).toHaveURL(/.*\/corporate-groups/);
    await expect(page.getByText('GRUPO OMEGA')).toBeVisible();
  });

  test('Deve editar grupo existente', async ({ page }) => {
    // Mock get group details
    await page.route('**/api/corporate-groups/1', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: { id: '1', name: 'GRUPO ALFA', description: 'Antiga', isActive: true } });
      } else if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        await route.fulfill({ status: 200, json: { id: '1' } });
      }
    });

    // Mock API for GET (List) after redirect
    await page.route('**/api/corporate-groups', async route => {
      await route.fulfill({ status: 200, json: [
        { id: '1', name: 'GRUPO ALFA EDITADO', isActive: true, customers: [] }
      ] });
    });

    await page.goto('http://localhost:3000/corporate-groups/1/edit');
    
    await expect(page.locator('input[name="name"]')).toHaveValue('GRUPO ALFA');
    
    // Edit form
    await page.locator('input[name="name"]').fill('GRUPO ALFA EDITADO');

    // Save
    await page.getByRole('button', { name: 'Salvar Grupo' }).click();

    // Verify Redirect
    await expect(page).toHaveURL(/.*\/corporate-groups/);
  });

  test('Deve visualizar detalhes do grupo econômico', async ({ page }) => {
    // Mock get group details
    await page.route('**/api/corporate-groups/1', async route => {
      await route.fulfill({ status: 200, json: { 
        id: '1', 
        name: 'GRUPO ALFA DETALHE', 
        description: 'Mock detalhe', 
        isActive: true,
        customers: [{ id: 'c1', corporateName: 'Cliente 1', document: '111' }]
      } });
    });
    
    await page.route('**/api/corporate-groups/1/financial-summary', async route => {
      await route.fulfill({ status: 200, json: { activeContractsCount: 2, totalActiveContractsValue: 1000, totalPendingDebt: 500 } });
    });

    await page.goto('http://localhost:3000/corporate-groups/1');
    
    // Should display details
    await expect(page.getByText('GRUPO ALFA DETALHE')).toBeVisible();
    await expect(page.getByText('Cliente 1')).toBeVisible();
    await expect(page.getByText('R$ 1.000,00')).toBeVisible();
  });
});
