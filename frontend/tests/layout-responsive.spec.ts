import { test, expect } from '@playwright/test';

test.describe('Layout Responsive Navigation', () => {
  // Configuração inicial para ignorar erros de API em testes estáticos de layout e fazer login
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/authentication/me', async route => {
      await route.fulfill({ status: 200, json: { id: '1', name: 'Mock User', role: 'ADMIN' } });
    });
    await page.route('**/api/authentication/me/tenants', async route => {
      await route.fulfill({ status: 200, json: [{ tenantId: 'fake-tenant-id', name: 'Tenant Mock' }] });
    });

    // Definir localStorage diretamente simulando login
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.setItem('gestao_token', 'fake-jwt-token');
      localStorage.setItem('gestao_tenant_id', 'fake-tenant-id');
    });
  });

  test('Desktop layout should show fixed sidebar', async ({ page }) => {
    // Configurar viewport Desktop (1280x720)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/');

    // A Sidebar principal deve estar visível
    const desktopSidebar = page.locator('aside.hidden.md\\:flex');
    await expect(desktopSidebar).toBeVisible();

    // O botão Hambúrguer do Mobile não deve estar visível
    const hamburgerBtn = page.locator('header button:has(svg.lucide-menu)');
    await expect(hamburgerBtn).toBeHidden();

    // Verificar se o texto "Identidade Visual e Dados" aparece no menu Desktop
    await expect(desktopSidebar.locator('text=Identidade Visual e Dados')).toBeVisible();
  });

  test('Mobile layout should hide fixed sidebar and use Sheet drawer', async ({ page }) => {
    // Configurar viewport Mobile (iPhone SE: 375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/');

    // A Sidebar principal (fixa) não deve estar visível
    const desktopSidebar = page.locator('aside.hidden.md\\:flex');
    await expect(desktopSidebar).toBeHidden();

    // O botão Hambúrguer deve estar visível
    const hamburgerBtn = page.locator('header button:has(svg.lucide-menu)');
    await expect(hamburgerBtn).toBeVisible();

    // O Sheet Drawer não deve estar visível ainda
    const drawerContent = page.locator('div[role="dialog"]');
    await expect(drawerContent).toBeHidden();

    // Clicar no botão Hambúrguer
    await hamburgerBtn.click();

    // O Sheet Drawer deve abrir
    await expect(drawerContent).toBeVisible();

    // Verificar se os links do menu aparecem dentro do drawer mobile
    await expect(drawerContent.locator('text=Dashboard')).toBeVisible();
    await expect(drawerContent.locator('text=Identidade Visual e Dados')).toBeVisible();

    // Fechar clicando no Esc ou fora
    await page.keyboard.press('Escape');
    await expect(drawerContent).toBeHidden();
  });
});
