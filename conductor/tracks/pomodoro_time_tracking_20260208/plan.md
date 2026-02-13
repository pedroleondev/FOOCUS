# Plano de Implementação: Sistema de Pomodoro e Time Tracking

## Fase 1: Arquitetura e Setup [checkpoint: TBD]
- [ ] Task: Definir estrutura de dados para sessões Pomodoro
- [ ] Task: Criar schema no Supabase: pomodoro_sessions, time_entries
- [ ] Task: Configurar Service Worker para timer em background
- [ ] Task: Criar Web Worker para timer preciso
- [ ] Task: Setup de notificações (browser + mobile)
- [ ] Task: Conductor - User Manual Verification 'Arquitetura e Setup' (Protocol in workflow.md)

## Fase 2: Timer Pomodoro Core [checkpoint: TBD]
- [ ] Task: Criar hook usePomodoro com estados (focus, shortBreak, longBreak)
- [ ] Task: Implementar lógica de timer com precisão de segundos
- [ ] Task: Criar componente PomodoroTimer (tela cheia)
- [ ] Task: Implementar controles: Start, Pause, Reset, Skip
- [ ] Task: Adicionar sons de notificação (start, complete, break)
- [ ] Task: Criar sistema de ciclos (4 pomodoros = long break)
- [ ] Task: Conductor - User Manual Verification 'Timer Pomodoro Core' (Protocol in workflow.md)

## Fase 3: Widget de Timer Persistente [checkpoint: TBD]
- [ ] Task: Criar componente PomodoroWidget (mini timer flutuante)
- [ ] Task: Implementar posicionamento fixo na tela (mobile: bottom, desktop: corner)
- [ ] Task: Adicionar modo compacto/expandido
- [ ] Task: Integrar widget em todas as views do app
- [ ] Task: Implementar drag-to-reposition (mobile)
- [ ] Task: Garantir que widget não obstrua conteúdo importante
- [ ] Task: Conductor - User Manual Verification 'Widget Persistente' (Protocol in workflow.md)

## Fase 4: Associação com Tarefas [checkpoint: TBD]
- [ ] Task: Criar interface de seleção de tarefa/objetivo ao iniciar Pomodoro
- [ ] Task: Implementar serviço timeTrackingService.ts
- [ ] Task: Criar hook useTimeTracking para métricas
- [ ] Task: Adicionar campo "timeSpent" em tasks e objectives
- [ ] Task: Implementar auto-save de sessões no Supabase
- [ ] Task: Criar visualização de tempo gasto em cada tarefa
- [ ] Task: Conductor - User Manual Verification 'Associação com Tarefas' (Protocol in workflow.md)

## Fase 5: Dashboard de Métricas [checkpoint: TBD]
- [ ] Task: Criar componente TimeTrackingDashboard
- [ ] Task: Implementar gráfico de sessões diárias (últimos 7 dias)
- [ ] Task: Criar gráfico de distribuição de tempo por objetivo
- [ ] Task: Implementar estatísticas: total de horas, média diária, streak
- [ ] Task: Criar visualização de produtividade (pomodoros vs breaks)
- [ ] Task: Adicionar heatmap de atividade (GitHub-style)
- [ ] Task: Conductor - User Manual Verification 'Dashboard de Métricas' (Protocol in workflow.md)

## Fase 6: Detecção de Procrastinação [checkpoint: TBD]
- [ ] Task: Criar algoritmo de detecção de procrastinação
- [ ] Task: Implementar análise de padrões (pausas frequentes, sessões curtas)
- [ ] Task: Criar sistema de alertas/notificações de procrastinação
- [ ] Task: Implementar sugestões para retomar o foco
- [ ] Task: Criar modo "Anti-Procrastinação" (bloqueio de distrações)
- [ ] Task: Adicionar gamificação para evitar procrastinação
- [ ] Task: Conductor - User Manual Verification 'Detecção de Procrastinação' (Protocol in workflow.md)

## Fase 7: Relatórios e Histórico [checkpoint: TBD]
- [ ] Task: Criar tela de histórico de sessões
- [ ] Task: Implementar filtros por data, objetivo, tipo de sessão
- [ ] Task: Criar relatório semanal (auto-gerado toda segunda)
- [ ] Task: Implementar relatório mensal com insights
- [ ] Task: Adicionar funcionalidade de exportação (CSV, JSON)
- [ ] Task: Criar comparação semanal (esta vs semana passada)
- [ ] Task: Conductor - User Manual Verification 'Relatórios e Histórico' (Protocol in workflow.md)

## Fase 8: Configurações e Personalização [checkpoint: TBD]
- [ ] Task: Criar tela de configurações do Pomodoro
- [ ] Task: Permitir customização de tempos (work, short break, long break)
- [ ] Task: Implementar seleção de sons (ou mute)
- [ ] Task: Adicionar toggle de notificações
- [ ] Task: Criar opção de auto-start breaks
- [ ] Task: Implementar tema visual do timer (cores)
- [ ] Task: Conductor - User Manual Verification 'Configurações' (Protocol in workflow.md)

## Fase 9: Background e Mobile [checkpoint: TBD]
- [ ] Task: Implementar timer funcionando em background (mobile)
- [ ] Task: Adicionar notificações push para mobile
- [ ] Task: Criar persistência local (localStorage/IndexedDB)
- [ ] Task: Implementar sincronização quando voltar online
- [ ] Task: Testar comportamento em diferentes navegadores mobile
- [ ] Task: Otimizar consumo de bateria
- [ ] Task: Conductor - User Manual Verification 'Background e Mobile' (Protocol in workflow.md)

## Fase 10: Integração com Gamificação [checkpoint: TBD]
- [ ] Task: Adicionar XP ao completar Pomodoros
- [ ] Task: Criar conquistas para streaks de foco
- [ ] Task: Implementar "Dias Produtivos" (meta de pomodoros)
- [ ] Task: Adicionar ranking/ladder de produtividade (opcional)
- [ ] Task: Criar desafios semanais de foco
- [ ] Task: Integrar métricas no perfil do usuário
- [ ] Task: Conductor - User Manual Verification 'Integração Gamificação' (Protocol in workflow.md)

## Fase 11: Testes e Performance [checkpoint: TBD]
- [ ] Task: Testar precisão do timer (drift test)
- [ ] Task: Testar comportamento em background (mobile)
- [ ] Task: Testar notificações em diferentes navegadores
- [ ] Task: Otimizar bundle size (lazy load charts)
- [ ] Task: Testar acessibilidade do timer
- [ ] Task: Criar testes E2E para fluxo completo
- [ ] Task: Conductor - User Manual Verification 'Testes e Performance' (Protocol in workflow.md)

## Fase 12: Documentação e Entrega [checkpoint: TBD]
- [ ] Task: Atualizar README.md com funcionalidades Pomodoro
- [ ] Task: Criar guia de uso do sistema Pomodoro
- [ ] Task: Documentar API de Time Tracking
- [ ] Task: Criar vídeo/tutorial de demonstração
- [ ] Task: Conductor - User Manual Verification 'Documentação' (Protocol in workflow.md)

## Configurações Padrão
```javascript
const DEFAULT_POMODORO_CONFIG = {
  workDuration: 25 * 60, // 25 minutos em segundos
  shortBreakDuration: 5 * 60, // 5 minutos
  longBreakDuration: 15 * 60, // 15 minutos
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
};
```

## Métricas Principais
- Total de horas focadas
- Média de pomodoros por dia
- Taxa de conclusão de sessões
- Tempo médio por tarefa
- Streak de dias produtivos
- Picos de produtividade (horários)
- Distribuição: Foco vs Pausas vs Procrastinação

## Integrações
- Gamification: XP por pomodoro completado
- Objectives: Tempo acumulado por objetivo
- Habits: Hábito "Manter foco diário"
- AI: Sugestão de duração baseada no tipo de tarefa
