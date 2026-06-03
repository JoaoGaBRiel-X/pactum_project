import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Document Generation and Signature Flow', () => {
  
  test('Should upload a template, generate document and manually sign', async ({ page }) => {
    // 0. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'e2e-test@lefer.com.br');
    await page.fill('input[type="password"]', 'PasswordE2E@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/');

    // 1. Go to Templates page
    await page.goto('http://localhost:3000/templates');
    
    // Click Upload Template
    await page.getByRole('button', { name: /Upload de Template/i }).click();
    
    // Fill the modal
    const uniqueName = 'Contrato de Teste Automação ' + Date.now();
    await page.getByPlaceholder('Ex: Contrato Padrão de Software').fill(uniqueName);
    await page.getByPlaceholder('Breve descrição').fill('Template enviado via playwright');
    
    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Using the input[type=file]
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    // We will upload the generated modelo_teste.docx
    await fileChooser.setFiles(path.join(__dirname, '../../../backend/modelo_teste.docx'));
    
    // Submit
    await page.getByRole('button', { name: /Fazer Upload/i }).click();
    
    // Wait for the modal to close and table to appear
    await expect(page.getByText(uniqueName).first()).toBeVisible({ timeout: 10000 });

    // 2. Go to Contracts Page
    const response = await page.request.get('http://localhost:3333/api/contracts', {
      headers: { 'x-tenant-id': 'tenant_1', 'x-user-id': 'test' }
    });
    const contracts = await response.json();
    const contractId = contracts[0].id;
    
    await page.goto(`http://localhost:3000/contracts/${contractId}`);
    // 3. Generate Document
    await expect(page.getByText('Documentos do Contrato')).toBeVisible();
    await page.getByRole('button', { name: /Gerar Novo Documento/i }).click();
    
    // Select the template
    await page.locator('select#templateSelect').selectOption({ label: uniqueName });
    
    // Accept alerts dynamically
    page.on('dialog', async dialog => {
      try {
        await dialog.accept();
      } catch (e) {}
    });

    // Click generate PDF
    await page.getByRole('button', { name: /Gerar PDF/i }).click();
    
    // Close modal by pressing escape
    await page.keyboard.press('Escape');

    // Wait for the document to appear in the list with GENERATED status
    await expect(page.getByText('Status: GENERATED').first()).toBeVisible({ timeout: 15000 });

    // 4. Manual Signature
    // Wait for Assinatura Manual button
    const manualSignButton = page.getByText('Assinatura Manual').first();
    await expect(manualSignButton).toBeVisible();

    await manualSignButton.click();

    // Expect status to change to Assinado
    await expect(page.getByText('Assinado', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

});
