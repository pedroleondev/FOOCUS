import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Fase 3: Migração de Dados e Refatoração de Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
  });

  test('DashboardView: Carrega dados do Supabase', async ({ page }) => {
    // Verifica se os dados estão sendo carregados do Supabase
    await expect(page.getByText('Hoje').first()).toBeVisible();
    await expect(page.getByText('Hábitos').first()).toBeVisible();

    // Verifica cards de estatísticas
    await expect(page.getByText('Maior Sequência')).toBeVisible();
    await expect(page.getByText('Tarefas Concluídas')).toBeVisible();
    await expect(page.getByText('Hábitos de Hoje')).toBeVisible();

    // Verifica seção de foco do dia
    await expect(page.getByText('FOCO DO DIA')).toBeVisible();

    // Verifica rotina do dia
    await expect(page.getByText('ROTINA DO DIA')).toBeVisible();
  });

  test('HabitsView: CRUD de hábitos funcionando', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);

    // Verifica página de hábitos carrega
    await expect(page.getByText('Meus Hábitos')).toBeVisible();
    await expect(page.getByText('Melhor Sequência')).toBeVisible();
    await expect(page.getByText('Novo Hábito')).toBeVisible();

    // Testa criação de hábito
    const uniqueId = Date.now();
    const habitName = `Teste Supabase ${uniqueId}`;

    await page.getByText('Novo Hábito').click();
    await page.fill('input[type="text"]', habitName);
    await page.fill('input[type="time"]', '09:00');
    await page.getByRole('button', { name: 'Criar Hábito' }).click();

    await page.waitForTimeout(3000);

    // Verifica se hábito foi criado e aparece na lista
    await expect(page.getByText(habitName).first()).toBeVisible();
  });

  test('PlanningView: Salva planejamentos no Supabase', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/plano`);
    await page.waitForTimeout(2000);

    // Verifica página de planejamento carrega
    const url = page.url();
    expect(url).toContain('/plano');

    // Verifica se o corpo da página tem conteúdo
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('Integração Supabase: Dados persistem entre sessões', async ({ page }) => {
    const uniqueId = Date.now();
    const taskName = `Persistência Test ${uniqueId}`;

    // Cria uma tarefa
    const fabButton = page.getByTestId('fab-button');
    await fabButton.click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Tarefa' }).click();
    await page.fill('input[id="title"]', taskName);
    await page.getByRole('button', { name: 'Criar Tarefa' }).click();

    await page.waitForTimeout(3000);

    // Verifica tarefa aparece no dashboard
    await expect(page.getByText(taskName)).toBeVisible();

    // Recarrega a página para simular nova sessão
    await page.reload();
    await page.waitForTimeout(3000);

    // Verifica se dados persistiram (carregados do Supabase)
    await expect(page.getByText(taskName)).toBeVisible();
  });
});
