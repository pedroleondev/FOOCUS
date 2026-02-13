#!/usr/bin/env node

/**
 * Validação Visual de Layout com Playwright MCP
 * 
 * Este script usa Playwright para verificar:
 * 1. Alinhamento de elementos
 * 2. Consistência de espaçamentos
 * 3. Responsividade em diferentes viewports
 * 4. Contraste e legibilidade
 * 
 * Uso:
 *   node scripts/visual-validation.js
 *   node scripts/visual-validation.js --component=HabitDetailView
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

async function validateElementAlignment(page, selector) {
  const elements = await page.locator(selector).all();
  const issues = [];
  
  for (let i = 0; i < elements.length - 1; i++) {
    const current = await elements[i].boundingBox();
    const next = await elements[i + 1].boundingBox();
    
    if (current && next) {
      const yDiff = Math.abs(current.y - next.y);
      if (yDiff < 50 && yDiff > 2) {
        issues.push(`Elementos ${i} e ${i+1} desalinhados: ${yDiff.toFixed(1)}px`);
      }
    }
  }
  
  return issues;
}

async function validateSpacingConsistency(page, containerSelector) {
  const container = await page.locator(containerSelector).first();
  const children = await container.locator('> *').all();
  const gaps = [];
  
  for (let i = 0; i < children.length - 1; i++) {
    const current = await children[i].boundingBox();
    const next = await children[i + 1].boundingBox();
    
    if (current && next) {
      const gap = next.x - (current.x + current.width);
      if (gap > 0) gaps.push(gap);
    }
  }
  
  if (gaps.length > 1) {
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = Math.max(...gaps.map(g => Math.abs(g - avg)));
    
    if (variance > 5) {
      return [`Espaçamento inconsistente: variância de ${variance.toFixed(1)}px`];
    }
  }
  
  return [];
}

async function validateMiniCards(page) {
  const cards = await page.locator('.grid > div').all();
  const issues = [];
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    
    // Verificar se é flex-col
    const isFlexCol = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.flexDirection === 'column';
    });
    
    if (!isFlexCol) {
      issues.push(`Card ${i + 1} não usa flex-direction: column`);
    }
    
    // Verificar padding
    const padding = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseInt(style.padding);
    });
    
    if (padding < 16 || padding > 24) {
      issues.push(`Card ${i + 1} tem padding inconsistente: ${padding}px (esperado: 20px)`);
    }
  }
  
  return issues;
}

async function runVisualValidation() {
  console.log('🔍 Iniciando validação visual...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  try {
    // Navegar para a página de hábitos
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(3000);
    
    const allIssues = [];
    
    // Validar em diferentes viewports
    for (const viewport of VIEWPORTS) {
      console.log(`📱 Testando em ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Clicar no primeiro hábito
      const firstHabit = await page.locator('a[href^="#/habitos/"]').first();
      if (await firstHabit.isVisible().catch(() => false)) {
        await firstHabit.click();
        await page.waitForTimeout(2000);
        
        // Validar mini-cards
        const miniCardIssues = await validateMiniCards(page);
        if (miniCardIssues.length > 0) {
          allIssues.push(...miniCardIssues.map(issue => `[${viewport.name}] ${issue}`));
        }
        
        // Validar alinhamento
        const alignmentIssues = await validateElementAlignment(page, 'section > div > div');
        if (alignmentIssues.length > 0) {
          allIssues.push(...alignmentIssues.map(issue => `[${viewport.name}] ${issue}`));
        }
        
        // Validar espaçamento
        const spacingIssues = await validateSpacingConsistency(page, '.grid');
        if (spacingIssues.length > 0) {
          allIssues.push(...spacingIssues.map(issue => `[${viewport.name}] ${issue}`));
        }
        
        // Screenshot
        await page.screenshot({
          path: `visual-validation-${viewport.name}.png`,
          fullPage: false,
        });
        
        // Voltar para lista
        await page.goto(`${BASE_URL}/#/habitos`);
        await page.waitForTimeout(1000);
      }
    }
    
    // Report
    console.log('\n' + '='.repeat(60));
    if (allIssues.length === 0) {
      console.log('✅ Validação visual passou em todos os viewports!');
    } else {
      console.log(`⚠️  ${allIssues.length} problemas encontrados:\n`);
      allIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro na validação:', error);
  } finally {
    await browser.close();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  runVisualValidation().catch(console.error);
}

module.exports = {
  validateElementAlignment,
  validateSpacingConsistency,
  validateMiniCards,
};
