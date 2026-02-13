import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Análise de elementos visuais
interface ElementAnalysis {
  selector: string;
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  computedStyle: Record<string, string>;
  issues: string[];
}

async function analyzeElement(page: Page, selector: string): Promise<ElementAnalysis[]> {
  return await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    return Array.from(elements).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const issues: string[] = [];
      
      // Verificar proporções
      if (rect.width < 44 || rect.height < 44) {
        issues.push(`Botão muito pequeno (${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px) - mínimo recomendado 44x44px`);
      }
      
      // Verificar padding
      const padding = parseInt(style.padding) || 0;
      if (padding < 8) {
        issues.push('Padding insuficiente para toque');
      }
      
      // Verificar contraste de fonte
      const fontSize = parseInt(style.fontSize);
      if (fontSize < 12) {
        issues.push(`Fonte muito pequena (${fontSize}px)`);
      }
      
      return {
        selector: sel,
        text: el.textContent?.substring(0, 50) || '',
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        computedStyle: {
          width: style.width,
          height: style.height,
          padding: style.padding,
          margin: style.margin,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          borderRadius: style.borderRadius,
          textAlign: style.textAlign
        },
        issues
      };
    });
  }, selector);
}

async function checkAlignment(page: Page): Promise<string[]> {
  const issues: string[] = [];
  
  // Verificar alinhamento de botões em containers
  const buttonContainers = await page.locator('button').all();
  const buttonBoxes = await Promise.all(
    buttonContainers.map(async (btn) => {
      const box = await btn.boundingBox();
      return { element: btn, box };
    })
  );
  
  // Verificar se botões adjacentes estão alinhados
  for (let i = 0; i < buttonBoxes.length - 1; i++) {
    const current = buttonBoxes[i].box;
    const next = buttonBoxes[i + 1].box;
    
    if (current && next) {
      const yDiff = Math.abs(current.y - next.y);
      if (yDiff < 50 && yDiff > 2) { // Estão na mesma linha aproximadamente mas desalinhados
        issues.push(`Botões desalinhados verticalmente: diferença de ${yDiff.toFixed(1)}px`);
      }
    }
  }
  
  return issues;
}

test.describe('UX/UI Analysis - Visual Quality Check', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('Dashboard - Button Analysis', async ({ page }) => {
    console.log('\n=== ANÁLISE DE BOTÕES DO DASHBOARD ===\n');
    
    const buttons = await analyzeElement(page, 'button');
    
    buttons.forEach((btn, index) => {
      console.log(`\nBotão ${index + 1}: "${btn.text}"`);
      console.log(`  Tamanho: ${btn.boundingBox?.width.toFixed(0)} x ${btn.boundingBox?.height.toFixed(0)} px`);
      console.log(`  Padding: ${btn.computedStyle.padding}`);
      console.log(`  Fonte: ${btn.computedStyle.fontSize}`);
      console.log(`  Border Radius: ${btn.computedStyle.borderRadius}`);
      
      if (btn.issues.length > 0) {
        console.log(`  ⚠️  PROBLEMAS:`);
        btn.issues.forEach(issue => console.log(`     - ${issue}`));
      }
    });
    
    // Verificar alinhamentos
    const alignmentIssues = await checkAlignment(page);
    if (alignmentIssues.length > 0) {
      console.log('\n⚠️  PROBLEMAS DE ALINHAMENTO:');
      alignmentIssues.forEach(issue => console.log(`   - ${issue}`));
    }
  });

  test('Dashboard - Layout Analysis', async ({ page }) => {
    console.log('\n=== ANÁLISE DE LAYOUT ===\n');
    
    // Verificar cards
    const cards = await page.locator('[class*="card"], [class*="Card"]').all();
    console.log(`Total de cards encontrados: ${cards.length}`);
    
    for (let i = 0; i < Math.min(cards.length, 5); i++) {
      const box = await cards[i].boundingBox();
      if (box) {
        console.log(`\nCard ${i + 1}:`);
        console.log(`  Dimensões: ${box.width.toFixed(0)} x ${box.height.toFixed(0)} px`);
        console.log(`  Posição: (${box.x.toFixed(0)}, ${box.y.toFixed(0)})`);
        
        // Verificar proporção
        const ratio = box.width / box.height;
        if (ratio < 0.5 || ratio > 3) {
          console.log(`  ⚠️  Proporção inadequada: ${ratio.toFixed(2)}`);
        }
      }
    }
    
    // Verificar espaçamentos entre elementos
    const gridItems = await page.locator('[class*="grid"] > *').all();
    console.log(`\nItens em grid: ${gridItems.length}`);
    
    if (gridItems.length > 1) {
      const firstBox = await gridItems[0].boundingBox();
      const secondBox = await gridItems[1].boundingBox();
      
      if (firstBox && secondBox) {
        const gap = secondBox.x - (firstBox.x + firstBox.width);
        console.log(`\nEspaçamento entre itens do grid: ${gap.toFixed(0)}px`);
        
        if (gap < 16) {
          console.log(`  ⚠️  Espaçamento muito pequeno (recomendado: 16-24px)`);
        }
      }
    }
  });

  test('Typography Analysis', async ({ page }) => {
    console.log('\n=== ANÁLISE TIPOGRÁFICA ===\n');
    
    const headings = await analyzeElement(page, 'h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading, index) => {
      console.log(`\nTítulo ${index + 1}: "${heading.text}"`);
      console.log(`  Tamanho da fonte: ${heading.computedStyle.fontSize}`);
      console.log(`  Altura da linha: ${heading.computedStyle.lineHeight}`);
      
      // Verificar hierarquia
      const fontSize = parseInt(heading.computedStyle.fontSize);
      if (heading.selector === 'h1' && fontSize < 24) {
        console.log(`  ⚠️  H1 muito pequeno (${fontSize}px)`);
      }
    });
  });

  test('Responsive Design Check', async ({ page }) => {
    console.log('\n=== ANÁLISE RESPONSIVA ===\n');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const desktopElements = await page.locator('main > div').all();
    console.log(`Elementos no desktop (1920px): ${desktopElements.length}`);
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletElements = await page.locator('main > div').all();
    console.log(`Elementos no tablet (768px): ${tabletElements.length}`);
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileElements = await page.locator('main > div').all();
    console.log(`Elementos no mobile (375px): ${mobileElements.length}`);
    
    // Verificar se o FAB está acessível em mobile
    const fab = await page.locator('[data-testid="fab-button"]').boundingBox();
    if (fab) {
      console.log(`\nFAB em mobile: (${fab.x.toFixed(0)}, ${fab.y.toFixed(0)})`);
      if (fab.x < 300 || fab.y < 500) {
        console.log(`  ⚠️  FAB pode estar muito próximo da borda em mobile`);
      }
    }
  });

  test('Color Contrast Analysis', async ({ page }) => {
    console.log('\n=== ANÁLISE DE CONTRASTE ===\n');
    
    const textElements = await page.locator('p, span, h1, h2, h3, h4, button, a').all();
    
    for (let i = 0; i < Math.min(textElements.length, 10); i++) {
      const style = await textElements[i].evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          text: el.textContent?.substring(0, 30) || ''
        };
      });
      
      if (style.text) {
        console.log(`Texto: "${style.text}"`);
        console.log(`  Cor: ${style.color}`);
        console.log(`  Fundo: ${style.backgroundColor}`);
      }
    }
  });

  test('Capture Screenshots for Visual Review', async ({ page }) => {
    // Screenshots de todas as páginas principais
    const pages = [
      { path: '/', name: 'dashboard' },
      { path: '/#/habitos', name: 'habits' },
      { path: '/#/objetivos', name: 'goals' },
      { path: '/#/foco', name: 'focus' },
      { path: '/#/sucesso', name: 'success' }
    ];
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const pageConfig of pages) {
      await page.goto(`${BASE_URL}${pageConfig.path}`);
      await page.waitForTimeout(2000);
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: `ui-analysis/${pageConfig.name}-${viewport.name}.png`,
          fullPage: true
        });
        
        console.log(`✓ Screenshot: ${pageConfig.name}-${viewport.name}.png`);
      }
    }
  });
});

test.describe('UX/UI Fixes Verification', () => {
  
  test('Verify Button Sizes', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    const buttons = await page.locator('button').all();
    let smallButtons = 0;
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        smallButtons++;
        const text = await button.textContent();
        console.log(`Botão pequeno: "${text}" (${box.width.toFixed(0)}x${box.height.toFixed(0)}px)`);
      }
    }
    
    console.log(`\nTotal de botões muito pequenos: ${smallButtons}`);
    expect(smallButtons).toBe(0);
  });

  test('Verify Spacing Consistency', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Verificar cards na mesma linha
    const cards = await page.locator('[class*="card"]').all();
    const cardBoxes = await Promise.all(
      cards.map(async (card) => await card.boundingBox())
    );
    
    const validBoxes = cardBoxes.filter(box => box !== null) as NonNullable<typeof cardBoxes[0]>[];
    
    if (validBoxes.length >= 2) {
      const gaps: number[] = [];
      
      for (let i = 0; i < validBoxes.length - 1; i++) {
        const gap = validBoxes[i + 1].x - (validBoxes[i].x + validBoxes[i].width);
        if (gap > 0) gaps.push(gap);
      }
      
      if (gaps.length > 1) {
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const maxDiff = Math.max(...gaps.map(g => Math.abs(g - avgGap)));
        
        console.log(`Espaçamento médio entre cards: ${avgGap.toFixed(1)}px`);
        console.log(`Variação máxima: ${maxDiff.toFixed(1)}px`);
        
        if (maxDiff > 10) {
          console.log('⚠️  Espaçamentos inconsistentes entre cards');
        }
      }
    }
  });
});
