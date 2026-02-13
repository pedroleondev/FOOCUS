# Plano de Implementação: Redesign Mobile-First e Gamificação

## Fase 1: Análise e Prototipação Mobile [checkpoint: TBD]

- [ ] Task: Analisar fluxos atuais e identificar pontos de fricção no mobile
- [ ] Task: Criar wireframes mobile para todas as telas principais
- [ ] Task: Definir sistema de design mobile-first (tipografia, espaçamento,
      cores)
- [ ] Task: Criar protótipo navegável no Figma (ou similar)
- [ ] Task: Conductor - User Manual Verification 'Análise e Prototipação Mobile'
      (Protocol in workflow.md)

## Fase 2: Estrutura Mobile-First e Navegação [checkpoint: 3b4938b]

- [x] Task: Refatorar App.tsx para layout mobile-first
- [x] Task: Criar componente MobileNavigation (menu inferior fixo)
- [x] Task: Implementar sistema de rotas otimizado para mobile
- [x] Task: Criar componente Header mobile compacto
- [~] Task: Adicionar gestos de swipe para navegação entre views
- [~] Task: Conductor - User Manual Verification 'Estrutura Mobile-First'
  (Protocol in workflow.md)

## Fase 3: Sistema de Gamificação [checkpoint: 02759ac]

- [x] Task: Criar schema no Supabase: user_stats, achievements, xp_history
- [x] Task: Criar hook useGamification com lógica de XP e níveis
- [x] Task: Criar componente GamificationView (dashboard de progresso)
- [x] Task: Implementar sistema de conquistas/badges
- [x] Task: Criar sistema de streaks diários
- [~] Task: Adicionar animações de recompensa (confetti, level up)
- [~] Task: Conductor - User Manual Verification 'Sistema de Gamificação'
  (Protocol in workflow.md)

## Fase 4: Habit Tracker Redesenhado [checkpoint: 28c4b04]

- [x] Task: Criar novo design de seleção de dias (visual claro seg/sex/sáb)
- [x] Task: Implementar HabitTrackerView mobile-optimized
- [x] Task: Criar componente DaySelector com estados visuais distintos
- [x] Task: Implementar sistema de "check-in" diário com um toque
- [x] Task: Adicionar visualização de streak atual e recorde
- [~] Task: Criar lembretes/notificações para hábitos
- [~] Task: Conductor - User Manual Verification 'Habit Tracker Redesenhado'
  (Protocol in workflow.md)

## Fase 5: Hierarquia de Objetivos e Tarefas [checkpoint: c37041b]

- [x] Task: Criar schema no Supabase: objectives, sub_objectives, micro_tasks
- [x] Task: Criar componente ObjectivesView (lista de objetivos principais)
- [~] Task: Criar componente ObjectiveDetailView (sub-objetivos e tarefas)
- [~] Task: Implementar drag-and-drop para reorganização (mobile-friendly)
- [x] Task: Criar sistema de progresso visual para cada nível da hierarquia
- [~] Task: Conductor - User Manual Verification 'Hierarquia de Objetivos'
  (Protocol in workflow.md)

## Fase 6: Distribuição Inteligente com IA [checkpoint: TBD]

- [ ] Task: Criar serviço aiTaskBreakdown.ts para integração com Gemini
- [ ] Task: Implementar sugestão de quebra de objetivos em micro-tarefas
- [ ] Task: Criar algoritmo de distribuição automática entre dias da semana
- [ ] Task: Implementar tela de revisão antes de confirmar distribuição
- [ ] Task: Adicionar opção de distribuição manual vs automática
- [ ] Task: Criar visualização semanal com tarefas distribuídas
- [ ] Task: Conductor - User Manual Verification 'Distribuição com IA' (Protocol
      in workflow.md)

## Fase 7: Dashboard Gamificado [checkpoint: TBD]

- [ ] Task: Refatorar DashboardView para modo mobile-first
- [ ] Task: Criar widget de "Missões do Dia" com gamificação
- [ ] Task: Implementar visualização de progresso diário/semanal
- [ ] Task: Adicionar cards de objetivos principais e secundários
- [ ] Task: Criar feed de atividades recentes
- [ ] Task: Implementar modo foco/distração visual
- [ ] Task: Conductor - User Manual Verification 'Dashboard Gamificado'
      (Protocol in workflow.md)

## Fase 8: Testes e Otimização Mobile [checkpoint: TBD]

- [ ] Task: Testar em dispositivos iOS (Safari)
- [ ] Task: Testar em dispositivos Android (Chrome)
- [ ] Task: Otimizar performance (lazy loading, code splitting)
- [ ] Task: Ajustar touch targets (mínimo 44px)
- [ ] Task: Verificar contraste e acessibilidade
- [ ] Task: Testar offline-first capabilities
- [ ] Task: Conductor - User Manual Verification 'Testes Mobile' (Protocol in
      workflow.md)

## Fase 9: Documentação e Entrega [checkpoint: TBD]

- [ ] Task: Atualizar README.md com novas funcionalidades
- [ ] Task: Criar documentação do sistema de gamificação
- [ ] Task: Documentar schema do banco atualizado
- [ ] Task: Criar guia de uso mobile para usuários
- [ ] Task: Conductor - User Manual Verification 'Documentação' (Protocol in
      workflow.md)

## Technical Requirements

- Mobile-first CSS (max-width breakpoints)
- Touch-friendly UI (min 44px touch targets)
- Fast load times (< 3s em 3G)
- Offline support (service worker)
- Smooth animations (60fps)
- Accessibility (WCAG 2.1 AA)

## Design Principles

1. **Thumb Zone**: Elementos principais na zona do polegar
2. **Progressive Disclosure**: Mostrar apenas o essencial inicialmente
3. **Visual Feedback**: Animações claras para cada ação
4. **One-Handed Use**: Todas as ações principais com uma mão
5. **Contextual**: Interface adapta-se ao contexto do usuário
