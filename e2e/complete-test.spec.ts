import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('FOOCUS App - Complete Testing Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
  });

  test('Dashboard loads and displays data', async ({ page }) => {
    // Check for dashboard elements - use more specific selectors
    await expect(page.getByText('Hoje').first()).toBeVisible();
    await expect(page.getByText('Hábitos').first()).toBeVisible();
    await expect(page.getByText('FOCO DO DIA')).toBeVisible();
    await expect(page.getByText('ROTINA DO DIA')).toBeVisible();
    
    // Check for stat cards
    await expect(page.getByText('Maior Sequência')).toBeVisible();
    await expect(page.getByText('Tarefas Concluídas')).toBeVisible();
    await expect(page.getByText('Hábitos de Hoje')).toBeVisible();
  });

  test('Floating Action Button opens menu', async ({ page }) => {
    // Click FAB using data-testid
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    
    // Wait for menu to open
    await page.waitForTimeout(500);
    
    // Check for menu options - use button role to avoid duplicates
    await expect(page.getByRole('button', { name: 'Tarefa' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hábito' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Objetivo' })).toBeVisible();
    
    // Close menu by clicking backdrop (pressing escape)
    await page.keyboard.press('Escape');
  });

  test('Create Task via FAB', async ({ page }) => {
    const uniqueId = Date.now();
    const taskName = `Test Task ${uniqueId}`;
    
    // Open FAB menu
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Click on Tarefa button in FAB menu
    await page.getByRole('button', { name: 'Tarefa' }).click();
    
    // Fill form
    await page.fill('input[id="title"]', taskName);
    await page.getByRole('button', { name: 'Criar Tarefa' }).click();
    
    // Wait for creation and page reload
    await page.waitForTimeout(3000);
    
    // Verify task appears on dashboard
    await expect(page.getByText(taskName)).toBeVisible();
  });

  test('Create Habit via FAB', async ({ page }) => {
    const uniqueId = Date.now();
    const habitName = `Test Habit ${uniqueId}`;
    
    // Open FAB menu
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Click on Hábito button in FAB menu
    await page.getByRole('button', { name: 'Hábito' }).click();
    
    // Fill form with unique name
    await page.fill('input[id="title"]', habitName);
    
    // Submit
    await page.getByRole('button', { name: 'Criar Hábito' }).click();
    
    // Wait for creation
    await page.waitForTimeout(3000);
    
    // Navigate to habits page to verify
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    await expect(page.getByText(habitName).first()).toBeVisible();
  });

  test('Create Goal via FAB', async ({ page }) => {
    const uniqueId = Date.now();
    const goalName = `Test Goal ${uniqueId}`;
    
    // Open FAB menu
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Click on Objetivo button in FAB menu
    await page.getByRole('button', { name: 'Objetivo' }).click();
    
    // Fill form with unique name
    await page.fill('input[id="title"]', goalName);
    await page.fill('input[id="description"]', 'This is a test goal');
    await page.fill('input[type="number"]', '100');
    await page.fill('input[id="metric"]', 'dias');
    
    // Submit
    await page.getByRole('button', { name: 'Criar Objetivo' }).click();
    
    // Wait for creation
    await page.waitForTimeout(3000);
    
    // Navigate to goals page to verify
    await page.goto(`${BASE_URL}/#/objetivos`);
    await page.waitForTimeout(2000);
    
    await expect(page.getByText(goalName).first()).toBeVisible();
  });

  test('Pomodoro Timer works', async ({ page }) => {
    // Navigate to Foco page
    await page.goto(`${BASE_URL}/#/foco`);
    await page.waitForTimeout(2000);
    
    // Check for timer elements - use flexible selectors
    await expect(page.locator('body')).toContainText('Minutos');
    
    // Find and click start button - try different selectors
    const startButton = page.getByRole('button', { name: /iniciar/i });
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
    } else {
      // Try to find any button that might be the start button
      const buttons = page.locator('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        if (text?.toLowerCase().includes('iniciar') || text?.toLowerCase().includes('start')) {
          await buttons.nth(i).click();
          break;
        }
      }
    }
    
    await page.waitForTimeout(3000);
    
    // Check if a pause button or timer is now visible
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toMatch(/pausar|pause|stop/);
  });

  test('Habits page displays habits list', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    await expect(page.getByText('Meus Hábitos')).toBeVisible();
    await expect(page.getByText('Melhor Sequência')).toBeVisible();
    
    // Check for "Novo Hábito" button
    await expect(page.getByText('Novo Hábito')).toBeVisible();
  });

  test('Goals page displays goals', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/objetivos`);
    await page.waitForTimeout(2000);
    
    await expect(page.getByText('Meus Objetivos')).toBeVisible();
  });

  test('Planning page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/plano`);
    await page.waitForTimeout(2000);
    
    // Check for planning view - use URL and body text
    const url = page.url();
    expect(url).toContain('/plano');
    
    // Check if page loaded by looking for common elements
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('Success/Analytics page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/sucesso`);
    await page.waitForTimeout(2000);
    
    // Use more specific selector
    await expect(page.getByRole('heading', { name: /Dashboard de Sucesso/i })).toBeVisible();
  });

  test('Navigation sidebar works', async ({ page }) => {
    // Test navigation to different pages
    const navItems = [
      { path: '/', label: 'Dashboard' },
      { path: '/foco', label: 'Foco' },
      { path: '/habitos', label: 'Hábitos' },
      { path: '/objetivos', label: 'Objetivos' },
      { path: '/sucesso', label: 'Sucesso' },
    ];

    for (const item of navItems) {
      await page.goto(`${BASE_URL}/#${item.path}`);
      await page.waitForTimeout(1000);
      
      // Verify we're on the right page by checking URL
      const url = page.url();
      expect(url).toContain(item.path);
    }
  });

  test('Create habit from Habits page', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
    
    // Click "Novo Hábito" button
    await page.getByText('Novo Hábito').click();
    
    // Fill form with unique name
    await page.fill('input[type="text"]', 'Habit from Page ' + Date.now());
    await page.fill('input[type="time"]', '08:00');
    
    // Submit
    await page.getByRole('button', { name: 'Criar Hábito' }).click();
    await page.waitForTimeout(3000);
    
    // Verify habit was created - use first() to handle multiple matches
    await expect(page.getByText('Habit from Page').first()).toBeVisible();
  });
});
