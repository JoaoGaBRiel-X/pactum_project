import { test, expect } from '@playwright/test';

test('Notification Flow Integration', async ({ page }) => {
  test.setTimeout(120000);

  // 1. Login
  await page.goto('http://localhost:3000/login');
  await page.fill('#email', 'e2e-test@lefer.com.br');
  await page.fill('#password', 'PasswordE2E@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/');

  // 2. Create Notification Template (if needed)
  await page.goto('http://localhost:3000/admin/notifications/new');
  const uniqueTemplateName = 'CONTRACT_ACTIVATED';
  await page.fill('input[placeholder="Ex: NEW_BOLETO"]', uniqueTemplateName);
  await page.fill('input[placeholder="Ex: Novo boleto disponível para {{customer.corporateName}}"]', 'Seu contrato com a Lefer foi ativado!');
  await page.fill('textarea', 'Olá {{customer.corporateName}}, seu contrato #{contract.id} foi ativado com sucesso!');
  await page.locator('form select').selectOption({ value: 'CONTRACT' }); // Categoria
  await page.click('button[type="submit"]');
  // It might fail if already exists, but we can just continue
  await page.waitForTimeout(2000); // give it time to save

  // 3. Create Customer
  await page.goto('http://localhost:3000/customers/new');
  const uniqueDoc = '99' + Date.now().toString().slice(-12);
  await page.fill('input[name="corporateName"]', 'Empresa E2E Test Notificação');
  await page.fill('input[name="document"]', uniqueDoc);
  
  // Fill first contact
  await page.fill('input[name="contacts.0.name"]', 'Contato Notificação');
  await page.fill('input[name="contacts.0.email"]', 'contato@e2e.com');
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/customers\/.+/);
  
  const customerUrl = page.url();
  
  // 4. Create Contract
  await page.goto('http://localhost:3000/contracts/new');
  
  // Select Customer (it's a dropdown, select the one we just created)
  await page.locator('select[name="customerId"]').selectOption({ label: `Empresa E2E Test Notificação (${uniqueDoc})` });
  
  // Select Product (pick the first one available)
  const productSelect = page.locator('select[name="productId"]');
  // We need a product to exist. If there's no product, the test can't continue.
  // Playwright selectOption can pick by index.
  await productSelect.selectOption({ index: 1 }); // Assuming index 1 is the first valid product
  
  await page.click('text=Adicionar Módulo');
  await page.locator('select[name="items.0.moduleId"]').selectOption({ index: 1 });
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/contracts\/.+/);
  
  // 5. Activate Contract
  // Now we are on the contract page
  // Click 'Ações' or 'Ativar Contrato'
  // Actually, the status change is triggered via a button 'Aprovar / Ativar' or we can click 'Editar Contrato' -> no, status is updated on details page.
  // Let's assume there is a button with text "Ativar Contrato" or similar in the Contracts details page.
  // In Phase 8, we implemented `updateStatus` in the details page.
  // There is a dropdown or button for status.
  await page.click('text=Mudar Status');
  await page.locator('select').selectOption('ACTIVE'); // if it's a dialog
  await page.fill('textarea[placeholder="Motivo da alteração (opcional)"]', 'Ativação E2E');
  await page.click('button:has-text("Confirmar")');
  
  await page.waitForTimeout(3000); // Wait for API and BullMQ to process

  // 6. Check Customer Communications History
  await page.goto(customerUrl);
  await page.waitForTimeout(1000);
  
  // Verify History Table
  const historyText = await page.textContent('text=CONTRACT_ACTIVATED');
  expect(historyText).toBeTruthy();
  
  const statusText = await page.textContent('text=Enviado'); // Ou falhou se o email Ethereal der erro
  expect(statusText).toBeTruthy();
});
