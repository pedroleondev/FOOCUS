# Track mobile_first_redesign_20260208 Context

## Overview
Redesign completo focado em mobile-first, gamificação e melhoria drástica da UX para criação e gestão de hábitos e objetivos.

## Problem Statement
- Usabilidade atual no mobile é péssima
- Dificuldade em distinguir dias selecionados (seg, sex, sáb parecem iguais)
- Interface de horários confusa e não intuitiva
- Navegação entre menus é confusa
- Falta sistema de gamificação para engajamento
- Não há hierarquia clara entre objetivos e tarefas
- Criação de hábitos é frustrante no mobile

## Goals
1. **Mobile-First**: Interface totalmente otimizada para telas pequenas
2. **Gamificação**: Sistema de "farm" de objetivos e hábitos diários
3. **Hierarquia Clara**: Objetivos → Sub-objetivos → Sub-tarefas
4. **Habit Tracker**: Sistema visual intuitivo com flags diárias claras
5. **Navegação Fluida**: Menu inferior fixo com ícones claros
6. **Distribuição Inteligente**: Sugestão de distribuição de tarefas entre dias
7. **IA Integrada**: Sugestão de quebra de objetivos em micro-tarefas

## User Stories
- Como usuário mobile, quero criar hábitos sem dificuldade visual
- Como usuário, quero ver meu progresso diário como um jogo
- Como usuário, quero quebrar grandes objetivos em passos pequenos
- Como usuário, quero distribuir tarefas automaticamente entre os dias
- Como usuário, quero marcar hábitos com um toque simples e visual

## Technical Notes
- Tailwind CSS com breakpoints mobile-first
- Componentes React otimizados para touch
- Animações suaves para feedback visual
- Supabase para persistência da gamificação
- Sistema de pontos XP e streaks

## Related Files
- components/HabitsView.tsx (será refatorado)
- components/DashboardView.tsx (será refatorado)
- components/PlanningView.tsx (será refatorado)
- Novo: components/GamificationView.tsx
- Novo: components/ObjectivesView.tsx
- Novo: components/HabitTrackerView.tsx
- Novo: components/MobileNavigation.tsx
- Novo: hooks/useGamification.ts
- Novo: hooks/useHabitTracker.ts
- Novo: services/aiTaskBreakdown.ts

## Success Criteria
- [ ] Interface completamente responsiva (mobile-first)
- [ ] Sistema de gamificação funcional (XP, níveis, conquistas)
- [ ] Criação de hábitos funcional no mobile
- [ ] Hierarquia de objetivos → sub-objetivos → tarefas
- [ ] Distribuição automática de tarefas entre dias
- [ ] Sugestão de IA para quebrar objetivos
- [ ] Navegação intuitiva com menu inferior
- [ ] Visual claro de dias selecionados para hábitos
- [ ] Time-to-task < 3 segundos no mobile

## Status
NEW - Awaiting implementation
