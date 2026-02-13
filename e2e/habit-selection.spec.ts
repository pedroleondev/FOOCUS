import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Seleção Múltipla e Exclusão de Hábitos', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/habitos`);
    await page.waitForTimeout(2000);
  });

  test('Ativar modo de seleção', async ({ page }) => {
    // Verificar se o botão "Selecionar" está visível
    const selectButton = page.getByRole('button', { name: 'Selecionar' });
    await expect(selectButton).toBeVisible();
    
    // Clicar no botão
    await selectButton.click();
    await page.waitForTimeout(500);
    
    // Verificar se toolbar de seleção apareceu
    const toolbar = page.getByText('selecionados');
    await expect(toolbar).toBeVisible();
    
    // Verificar se botão "Cancelar" está visível
    const cancelButton = page.getByRole('button', { name: 'Cancelar' });
    await expect(cancelButton).toBeVisible();
  });

  test('Selecionar e desmarcar hábitos', async ({ page }) => {
    // Ativar modo de seleção
    await page.getByRole('button', { name: 'Selecionar' }).click();
    await page.waitForTimeout(500);
    
    // Selecionar o primeiro hábito
    const firstHabit = page.locator('div[class*="rounded-[2rem]"]').first();
    await firstHabit.click();
    await page.waitForTimeout(300);
    
    // Verificar se contador mostra 1 selecionado
    const counter = page.getByText('1 de');
    await expect(counter).toBeVisible();
    
    // Verificar se botão de excluir apareceu
    const deleteButton = page.getByRole('button', { name: /Excluir/ });
    await expect(deleteButton).toBeVisible();
  });

  test('Selecionar todos os hábitos', async ({ page }) => {
    // Ativar modo de seleção
    await page.getByRole('button', { name: 'Selecionar' }).click();
    await page.waitForTimeout(500);
    
    // Clicar em "Selecionar Todos"
    const selectAllButton = page.getByRole('button', { name: 'Selecionar Todos' });
    await expect(selectAllButton).toBeVisible();
    await selectAllButton.click();
    await page.waitForTimeout(300);
    
    // Verificar se texto mudou para "Desmarcar Todos"
    const deselectAllButton = page.getByRole('button', { name: 'Desmarcar Todos' });
    await expect(deselectAllButton).toBeVisible();
    
    // Verificar se contador mostra todos selecionados
    const counter = page.locator('text=/\\d+ de \\d+ selecionados/');
    await expect(counter).toBeVisible();
  });

  test('Abrir modal de confirmação de exclusão', async ({ page }) => {
    // Ativar modo de seleção
    await page.getByRole('button', { name: 'Selecionar' }).click();
    await page.waitForTimeout(500);
    
    // Selecionar um hábito
    const firstHabit = page.locator('div[class*="rounded-[2rem]"]').first();
    await firstHabit.click();
    await page.waitForTimeout(300);
    
    // Clicar em excluir
    const deleteButton = page.getByRole('button', { name: /Excluir/ });
    await deleteButton.click();
    await page.waitForTimeout(300);
    
    // Verificar se modal de confirmação apareceu
    const modal = page.getByText('Excluir Hábitos');
    await expect(modal).toBeVisible();
    
    // Verificar botões do modal
    const cancelButton = page.getByRole('button', { name: 'Cancelar' }).last();
    await expect(cancelButton).toBeVisible();
    
    const confirmButton = page.getByRole('button', { name: 'Excluir' }).last();
    await expect(confirmButton).toBeVisible();
    
    // Tirar screenshot
    await page.screenshot({ path: 'delete-confirmation-modal.png' });
  });

  test('Abrir modal de edição ao clicar no lápis', async ({ page }) => {
    // Hover no primeiro hábito para mostrar os botões
    const firstHabit = page.locator('div[class*="rounded-[2rem]"]').first();
    await firstHabit.hover();
    await page.waitForTimeout(300);
    
    // Clicar no botão de editar (lápis)
    const editButton = page.locator('button[title="Editar hábito"]').first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForTimeout(300);
    
    // Verificar se modal de edição apareceu
    const modal = page.getByText('Editar Hábito');
    await expect(modal).toBeVisible();
    
    // Verificar campos do formulário
    const nameInput = page.locator('input[placeholder*="Meditação"]').first();
    await expect(nameInput).toBeVisible();
    
    // Verificar botões
    const cancelButton = page.getByRole('button', { name: 'Cancelar' }).last();
    await expect(cancelButton).toBeVisible();
    
    const saveButton = page.getByRole('button', { name: 'Salvar Alterações' });
    await expect(saveButton).toBeVisible();
    
    // Tirar screenshot
    await page.screenshot({ path: 'edit-modal.png' });
  });
});
