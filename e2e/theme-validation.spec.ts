import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Validação Tema Claro - Sub-menus', () => {
  
  test('HabitDetailView - Todos os elementos com tema claro', async ({ page }) => {
    // Navegar para a página de hábitos
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    // Clicar no primeiro hábito (se existir)
    const firstHabit = page.locator('a[href^="#/habitos/"]').first();
    
    if (await firstHabit.isVisible().catch(() => false)) {
      await firstHabit.click();
      await page.waitForTimeout(2000);
      
      // Verificar se não há classes dark no DOM
      const darkElements = await page.locator('[class*="dark:bg-"], [class*="dark:text-white"]').count();
      
      console.log(`Elementos com classes dark encontrados: ${darkElements}`);
      expect(darkElements).toBe(0);
      
      // Verificar se os cards principais têm fundo branco
      const mainCard = page.locator('section').first();
      const bgColor = await mainCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });
      
      console.log(`Cor de fundo do card principal: ${bgColor}`);
      // rgb(255, 255, 255) = branco
      expect(bgColor).toBe('rgb(255, 255, 255)');
      
      // Verificar se o texto está escuro (não branco)
      const title = page.locator('h1').first();
      const textColor = await title.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.color;
      });
      
      console.log(`Cor do texto do título: ${textColor}`);
      // Deve ser uma cor escura (não branca)
      expect(textColor).not.toBe('rgb(255, 255, 255)');
    }
  });

  test('Modal de criação de hábito - Tema claro', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    // Abrir modal de criação
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Clicar em Hábito usando o texto específico do FAB
    await page.locator('button', { hasText: /^Hábito$/ }).click();
    await page.waitForTimeout(1000);
    
    // Verificar se não há classes dark no modal
    const darkElements = await page.locator('[class*="dark:bg-"], [class*="dark:text-white"]').count();
    console.log(`Elementos dark no modal: ${darkElements}`);
    expect(darkElements).toBe(0);
    
    // Verificar se o texto do título está visível (prova que o modal abriu)
    const title = page.getByRole('heading', { name: 'Novo Hábito' });
    await expect(title).toBeVisible();
  });
});
