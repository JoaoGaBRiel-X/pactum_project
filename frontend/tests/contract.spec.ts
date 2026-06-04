import { test, expect } from '@playwright/test';

test.describe('Contract E2E', () => {
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

  test('Should interact with signature flow (PENDING_SIGNATURE and Assinatura Manual)', async ({ page }) => {
    // Mock the API for fetching contract details
    await page.route('**/api/contracts/contract-123', async route => {
      const json = { 
        id: 'contract-123', 
        status: 'DRAFT', 
        totalValue: '1500', 
        globalDiscount: '0', 
        customer: { corporateName: 'Test Corp', document: '123' },
        product: { name: 'ERP' },
        items: [],
        documents: [
          { id: 'doc-1', status: 'GENERATED', createdAt: new Date().toISOString() }
        ],
        history: []
      };
      // We fulfill it with a delay to allow the loading state to show up
      await route.fulfill({ json });
    });

    // Mock the API for updating status
    let patchedStatus = '';
    await page.route('**/api/contracts/contract-123/status', async route => {
      if (route.request().method() === 'PATCH') {
        const body = JSON.parse(route.request().postData() || '{}');
        patchedStatus = body.status;
        await route.fulfill({ status: 200, json: { status: patchedStatus } });
      }
    });

    await page.goto('http://localhost:3000/contracts/contract-123');

    await expect(page.locator('h1').filter({ hasText: 'Contrato #contract' })).toBeVisible();

    // Check that we are in DRAFT
    await expect(page.locator('span', { hasText: 'DRAFT' })).toBeVisible();

    // The 'Enviar para Assinatura' button should be visible in DRAFT
    const sendSignatureBtn = page.getByRole('button', { name: /Enviar para Assinatura/i });
    
    // We can't automatically accept window.confirm in playwright without an event handler
    page.once('dialog', dialog => dialog.accept());
    await sendSignatureBtn.click();

    // Since we accepted the dialog, it should call the PATCH endpoint
    expect(patchedStatus).toBe('PENDING_SIGNATURE');

    // Test Clicksign Toast / Alert
    const clicksignBtn = page.getByRole('button', { name: 'Enviar para Clicksign' });
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Funcionalidade Clicksign postergada');
      dialog.accept();
    });
    await clicksignBtn.click();
  });

  test('Should handle Contract Amendment (Aditivo) flow', async ({ page }) => {
    // Mock the API for fetching ACTIVE contract details
    await page.route('**/api/contracts/contract-456', async route => {
      const json = { 
        id: 'contract-456', 
        status: 'ACTIVE', 
        totalValue: '1500', 
        globalDiscount: '0', 
        customer: { corporateName: 'Test Corp', document: '123' },
        product: { 
          name: 'ERP',
          modules: [
            { id: 'mod1', name: 'Financeiro', price: 1500 },
            { id: 'mod2', name: 'Estoque', price: 800 }
          ]
        },
        items: [
          { moduleId: 'mod1', quantity: 1, unitPrice: 1500, discount: 0 }
        ],
        history: []
      };
      await route.fulfill({ json });
    });

    // Mock Amendment POST
    let amendmentPayload: any = {};
    await page.route('**/api/contracts/contract-456/amend', async route => {
      amendmentPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 200, json: { pendingAmendment: amendmentPayload } });
    });

    await page.goto('http://localhost:3000/contracts/contract-456');

    // Check that we are in ACTIVE
    await expect(page.locator('span', { hasText: 'ACTIVE' })).toBeVisible();

    // Click "Gerar Aditivo"
    const amendBtn = page.getByRole('button', { name: /Gerar Aditivo/i });
    await amendBtn.click();

    // Modal should open
    await expect(page.locator('h2').filter({ hasText: 'Gerar Aditivo Contratual' })).toBeVisible();

    // Add another module (mod2)
    // There should be an "Adicionar" button for "Estoque"
    const addMod2Btn = page.locator('div').filter({ hasText: 'Estoque' }).getByRole('button', { name: 'Adicionar' });
    await addMod2Btn.click();

    // Change global discount
    await page.locator('input').last().fill('100'); // Assuming the last input is global discount in the modal

    // Confirm Amendment
    page.once('dialog', dialog => dialog.accept()); // Alert success
    const submitBtn = page.getByRole('button', { name: 'Gerar Aditivo' }).last();
    await submitBtn.click();

    // Assert that the payload was sent correctly
    expect(amendmentPayload.globalDiscount).toBe(100);
    expect(amendmentPayload.items.length).toBe(2);
  });
});
