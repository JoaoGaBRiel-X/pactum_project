import { test, expect } from '@playwright/test';

test.describe('Contract E2E', () => {
  test('Should validate required fields in New Contract Form', async ({ page }) => {
    await page.goto('http://localhost:3000/contracts/new');

    // Wait for page to load
    await expect(page.locator('h1').filter({ hasText: 'Novo Contrato' })).toBeVisible();

    // Click "Gerar Contrato" without filling anything
    // Button might be disabled due to our frontend validations
    const submitBtn = page.getByRole('button', { name: 'Gerar Contrato' });
    await expect(submitBtn).toBeDisabled();

    // The validation errors might not show until touched, but since submit is disabled, it works correctly.
  });

  test('Should compute total value correctly when global discount is applied', async ({ page }) => {
    await page.goto('http://localhost:3000/contracts/new');

    // To fully test this, we would need mocked data for Customers and Products, 
    // or rely on the backend being seeded. 
    // We will assume the backend responds or we will mock the API calls.
    
    // Mock the API for customers
    await page.route('**/api/customers', async route => {
      const json = [{ id: 'cust1', corporateName: 'Test Corp', document: '123' }];
      await route.fulfill({ json });
    });

    // Mock the API for products
    await page.route('**/api/products', async route => {
      const json = [{ 
        id: 'prod1', 
        name: 'ERP Completo', 
        isActive: true,
        modules: [
          { id: 'mod1', name: 'Financeiro', price: 1500, isActive: true },
          { id: 'mod2', name: 'Estoque', price: 800, isActive: true }
        ]
      }];
      await route.fulfill({ json });
    });

    await page.goto('http://localhost:3000/contracts/new');

    // Select Customer
    await page.locator('select[name="customerId"]').selectOption('cust1');
    
    // Select Product
    await page.locator('select[name="productId"]').selectOption('prod1');

    // Add module
    await page.getByRole('button', { name: 'Adicionar Módulo' }).click();
    
    // Select the module
    await page.locator('select[name="items.0.moduleId"]').selectOption('mod1'); // Financeiro (1500)
    
    // Validate Subtotal and Total
    await expect(page.locator('div').filter({ hasText: /^R\$ 1500\.00$/ }).first()).toBeVisible();
    await expect(page.locator('div', { hasText: 'Valor Total Recorrente' }).locator('xpath=..').locator('text=R$ 1.500,00')).toBeVisible();

    // Add another module
    await page.getByRole('button', { name: 'Adicionar Módulo' }).click();
    await page.locator('select[name="items.1.moduleId"]').selectOption('mod2'); // Estoque (800)
    
    // Total should be 2300
    await expect(page.locator('div', { hasText: 'Valor Total Recorrente' }).locator('xpath=..').locator('text=R$ 2.300,00')).toBeVisible();

    // Apply global discount
    await page.locator('input[name="globalDiscount"]').fill('300');

    // Total should be 2000
    await expect(page.locator('div', { hasText: 'Valor Total Recorrente' }).locator('xpath=..').locator('text=R$ 2.000,00')).toBeVisible();

    // Ensure the submit button is enabled
    const submitBtn = page.getByRole('button', { name: 'Gerar Contrato' });
    await expect(submitBtn).toBeEnabled();
  });
});
