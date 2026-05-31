import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Complete Flow: Login, Template, Customer, Contract, Document, Signature', () => {

  test('Should execute the entire flow end-to-end', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout for the whole flow

    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'joaogabriel.mc@hotmail.com');
    await page.fill('input[type="password"]', 'gp7eog38A@1');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL('http://localhost:3000/');

    // 2. Upload Template
    await page.goto('http://localhost:3000/templates');
    await page.getByRole('button', { name: /Upload de Template/i }).click();
    
    const uniqueTemplateName = 'Template E2E ' + Date.now();
    await page.getByPlaceholder('Ex: Contrato Padrão de Software').fill(uniqueTemplateName);
    await page.getByPlaceholder('Breve descrição').fill('Upload automatizado via E2E');
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../../../backend/modelo_teste.docx'));
    
    await page.getByRole('button', { name: /Fazer Upload/i }).click();
    await expect(page.getByText(uniqueTemplateName).first()).toBeVisible({ timeout: 15000 });

    // 3. Create Customer with Contacts
    await page.goto('http://localhost:3000/customers/new');
    const cnpjValue = '12345678000199'; // A valid-like CNPJ format or just numbers
    await page.getByPlaceholder('00.000.000/0001-00').fill('12.345.678/0001-99');
    await page.getByPlaceholder('Nome da Empresa LTDA').fill('Empresa E2E Teste LTDA');
    await page.getByPlaceholder('Nome Fantasia').fill('E2E Corp');

    // Add Contact
    await page.getByRole('button', { name: /Adicionar Contato/i }).click();
    await page.getByPlaceholder('Nome', { exact: true }).fill('Contato Representante');
    await page.getByPlaceholder('000.000.000-00').fill('123.456.789-00');
    await page.getByPlaceholder('Ex: Financeiro').fill('Diretor');
    
    await page.getByRole('button', { name: /Salvar Cliente/i }).click();
    await expect(page).toHaveURL('http://localhost:3000/customers');

    // 4. Create Contract
    await page.goto('http://localhost:3000/contracts/new');
    // Select the first customer
    await page.locator('select#customerSelect').selectOption({ index: 1 });
    // Select the first product
    await page.locator('select#productSelect').selectOption({ index: 1 });

    // Add module
    await page.getByRole('button', { name: /Adicionar Módulo/i }).click();
    await page.locator('select[name="items.0.moduleId"]').selectOption({ index: 1 });

    await page.getByRole('button', { name: /Salvar Rascunho/i }).click();
    await expect(page.url()).toContain('/contracts/');

    // Wait for contract page to load
    await expect(page.getByText('Documentos do Contrato')).toBeVisible({ timeout: 10000 });

    // 5. Generate Document
    await page.getByRole('button', { name: /Gerar Novo Documento/i }).click();
    await page.locator('select#templateSelect').selectOption({ label: uniqueTemplateName });
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: /Gerar PDF/i }).click();
    await page.keyboard.press('Escape');

    // Wait for document to be generated
    await expect(page.getByText('Status: GENERATED').first()).toBeVisible({ timeout: 20000 });

    // 6. Manual Signature
    await page.getByText('Assinatura Manual').first().click();

    // Verify contract is now Active and document is Signed
    await expect(page.getByText('Assinado', { exact: true }).first()).toBeVisible({ timeout: 10000 });
    
    // Verify timeline updated
    await expect(page.getByText('Ativado via Assinatura Manual de Documento')).toBeVisible();
  });
});
