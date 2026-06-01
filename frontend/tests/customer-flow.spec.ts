import { test, expect } from '@playwright/test';

test.describe('Customer Management Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock global layout requests to prevent 401 redirect
    await page.route('**/api/authentication/me', async route => {
      await route.fulfill({ status: 200, json: { id: '1', name: 'Mock User', role: 'ADMIN' } });
    });
    
    await page.route('**/api/tenant-settings', async route => {
      await route.fulfill({ status: 200, json: { name: 'Tenant Mock', slug: 'mock' } });
    });

    // Inject auth mock
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.setItem('gestao_tenant_id', 'mock-tenant-id');
      localStorage.setItem('gestao_token', 'mock-token');
    });
  });

  test('Deve validar formulário vazio e mostrar erros', async ({ page }) => {
    await page.route('**/api/corporate-groups', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.goto('http://localhost:3000/customers/new');
    await expect(page.getByText('Novo Cliente')).toBeVisible();

    // Click Save
    await page.getByRole('button', { name: 'Salvar Cliente' }).click();

    // Zod Validation errors should appear
    await expect(page.getByText('Razão Social é obrigatória')).toBeVisible();
  });

  test('Deve mascarar CNPJ, fazer auto-fill da BrasilAPI e criar cliente', async ({ page }) => {
    // Mock Corporate Groups
    await page.route('**/api/corporate-groups', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    // Mock Brasil API
    await page.route('**/api/cnpj/v1/*', async route => {
      await route.fulfill({
        status: 200,
        json: {
          razao_social: 'EMPRESA MOCK LIMITADA',
          nome_fantasia: 'MOCK TECH',
          cep: '12345-678',
          logradouro: 'Rua Mock',
          numero: '100',
          complemento: 'Sala 1',
          bairro: 'Centro',
          municipio: 'São Paulo',
          uf: 'SP',
          qsa: [{ nome_socio: 'João da Silva', cnpj_cpf_do_socio: '111.222.333-44' }]
        }
      });
    });

    // Mock API for POST (Create) and GET (List)
    await page.route('**/api/customers', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { id: 'new-id' } });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: [
          { id: 'new-id', document: '11.111.111/1111-11', corporateName: 'EMPRESA MOCK LIMITADA' }
        ] });
      } else {
        await route.continue();
      }
    });

    await page.goto('http://localhost:3000/customers/new');
    
    // Type CNPJ without mask
    const documentInput = page.getByPlaceholder('00.000.000/0001-00').first();
    await documentInput.fill('11111111111111');
    
    // Verify Mask
    await expect(documentInput).toHaveValue('11.111.111/1111-11');

    // Wait for BrasilAPI mock to fill fields
    await expect(page.locator('input[name="corporateName"]')).toHaveValue('EMPRESA MOCK LIMITADA');
    await expect(page.locator('input[name="tradeName"]')).toHaveValue('MOCK TECH');
    await expect(page.getByPlaceholder('00000-000', { exact: true })).toHaveValue('12345-678');
    await expect(page.getByPlaceholder('Rua / Avenida')).toHaveValue('Rua Mock');
    await expect(page.getByPlaceholder('Nome do Sócio')).toHaveValue('João da Silva');

    // Save
    await page.locator('button[type="submit"]').click();

    // Verify Redirect
    await expect(page).toHaveURL(/.*\/customers/);
    await expect(page.getByPlaceholder('Buscar por Razão Social ou CNPJ...')).toBeVisible();
  });

  test('Deve filtrar clientes na lista', async ({ page }) => {
    await page.route('**/api/customers', async route => {
      await route.fulfill({ status: 200, json: [
        { id: '1', document: '11.111.111/1111-11', corporateName: 'EMPRESA A' },
        { id: '2', document: '22.222.222/2222-22', corporateName: 'EMPRESA B' }
      ] });
    });

    await page.goto('http://localhost:3000/customers');

    await expect(page.getByText('EMPRESA A')).toBeVisible();
    await expect(page.getByText('EMPRESA B')).toBeVisible();

    // Search for EMPRESA A
    await page.getByPlaceholder('Buscar por Razão Social ou CNPJ...').fill('EMPRESA A');

    await expect(page.getByText('EMPRESA A')).toBeVisible();
    await expect(page.getByText('EMPRESA B')).not.toBeVisible();
  });
});
