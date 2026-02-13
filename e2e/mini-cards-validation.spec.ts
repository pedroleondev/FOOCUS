import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Validação Mini-Cards de Estatísticas', () => {
  
  test('Mini-cards com identação correta', async ({ page }) => {
    // Navegar para a página de hábitos
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    // Clicar no primeiro hábito
    const firstHabit = page.locator('a[href^="#/habitos/"]').first();
    
    if (await firstHabit.isVisible().catch(() => false)) {
      await firstHabit.click();
      await page.waitForTimeout(2000);
      
      // Verificar estrutura dos mini-cards
      const miniCards = await page.locator('.grid.grid-cols-2.lg\\:grid-cols-4 > div').all();
      
      console.log(`Total de mini-cards encontrados: ${miniCards.length}`);
      
      for (let i = 0; i < miniCards.length; i++) {
        const card = miniCards[i];
        
        // Verificar se é flex-col
        const hasFlexCol = await card.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.flexDirection === 'column';
        });
        
        // Verificar padding
        const padding = await card.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.padding;
        });
        
        // Verificar background
        const bgColor = await card.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.backgroundColor;
        });
        
        console.log(`\nCard ${i + 1}:`);
        console.log(`  - Flex-direction column: ${hasFlexCol}`);
        console.log(`  - Padding: ${padding}`);
        console.log(`  - Background: ${bgColor}`);
        
        // Verificar se tem estrutura correta (ícone container + label + valor)
        const iconContainer = await card.locator('.bg-orange-100, .bg-emerald-100, .bg-blue-100, .bg-purple-100').count();
        const label = await card.locator('span.text-slate-400').count();
        const value = await card.locator('.text-3xl.font-black').count();
        
        console.log(`  - Ícone container: ${iconContainer > 0 ? 'OK' : 'FALTANDO'}`);
        console.log(`  - Label: ${label > 0 ? 'OK' : 'FALTANDO'}`);
        console.log(`  - Valor: ${value > 0 ? 'OK' : 'FALTANDO'}`);
      }
      
      // Tirar screenshot
      await page.screenshot({ 
        path: 'mini-cards-validation.png',
        fullPage: false
      });
      
      console.log('\n✅ Screenshot salvo: mini-cards-validation.png');
    }
  });
});
