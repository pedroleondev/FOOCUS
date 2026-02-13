# SQL Queries - FOOCUS

Este diretório contém todas as queries SQL necessárias para configurar o banco de dados Supabase do projeto FOOCUS.

## 📋 Índice de Migrations

### 001_gamification_system.sql
**Track:** mobile_first_redesign_20260208

Cria o sistema completo de gamificação:
- `user_stats` - Estatísticas do usuário (XP, nível, streaks)
- `achievements` - Conquistas e badges desbloqueados
- `xp_history` - Histórico de ganho de XP
- `daily_quests` - Missões diárias
- `level_thresholds` - Tabela de níveis (1-20)

**Funções criadas:**
- `get_user_level(user_uuid)` - Retorna nível atual baseado no XP
- `add_xp(user_uuid, amount, source, description)` - Adiciona XP e atualiza nível automaticamente

**Trigger:**
- Cria automaticamente `user_stats` para novos usuários

---

### 002_objectives_hierarchy.sql
**Track:** mobile_first_redesign_20260208

Cria a hierarquia de objetivos:
- `objectives` - Objetivos principais
- `sub_objectives` - Sub-objetivos
- `micro_tasks` - Micro-tarefas executáveis

**Colunas principais:**
- Progresso automático (`progress_percentage`)
- Tempo estimado vs gasto (`estimated_minutes`, `time_spent_minutes`)
- Sistema de XP por conclusão

**Funções criadas:**
- `update_objective_progress()` - Atualiza progresso automaticamente
- `complete_objective(objective_uuid)` - Completa objetivo e dá XP
- `complete_micro_task(task_uuid)` - Completa tarefa e dá XP

**Triggers:**
- Atualização automática de progresso ao completar micro-tasks

---

### 003_habit_tracker_enhanced.sql
**Track:** mobile_first_redesign_20260208

Melhorias no sistema de hábitos:
- Adiciona ícones, cores, streaks à tabela `habits`
- `habit_checkins` - Check-ins diários de hábitos
- `habit_streaks` - Histórico de streaks

**Funções criadas:**
- `checkin_habit(habit_uuid, notes)` - Faz check-in com cálculo automático de streak
- `undo_checkin(habit_uuid, checkin_date)` - Desfaz check-in
- `get_habit_checkins_month(habit_uuid, year_month)` - Retorna check-ins do mês

**View:**
- `habit_stats` - Estatísticas agregadas de hábitos

**Features:**
- Streak automático (detecta se quebrou ou continua)
- Badges automáticos para streaks (7, 30, 60, 90, 180, 365 dias)
- XP por check-in

---

### 004_pomodoro_time_tracking.sql
**Track:** pomodoro_time_tracking_20260208

Sistema completo de Pomodoro e time tracking:
- `pomodoro_sessions` - Sessões de Pomodoro
- `time_entries` - Entradas de tempo (tracking contínuo)
- `productivity_stats` - Estatísticas de produtividade (cache)
- `pomodoro_configs` - Configurações personalizadas por usuário

**Funções criadas:**
- `complete_pomodoro_session(session_uuid)` - Completa sessão e atualiza tempo nas tarefas
- `calculate_daily_stats(user_uuid, calc_date)` - Calcula estatísticas do dia
- `get_objective_time_spent(objective_uuid)` - Retorna tempo total gasto em objetivo

**View:**
- `daily_pomodoro_summary` - Resumo diário de sessões

**Configurações padrão:**
- Work: 25 min
- Short break: 5 min
- Long break: 15 min
- 4 pomodoros até long break

---

## 🚀 Ordem de Execução

Execute as migrations na seguinte ordem:

```sql
-- 1. Gamificação (base para todas as outras)
\i 001_gamification_system.sql

-- 2. Hierarquia de Objetivos
\i 002_objectives_hierarchy.sql

-- 3. Habit Tracker Melhorado
\i 003_habit_tracker_enhanced.sql

-- 4. Pomodoro e Time Tracking
\i 004_pomodoro_time_tracking.sql
```

Ou no Supabase SQL Editor, execute uma por vez na ordem acima.

---

## 🔒 Segurança

Todas as tabelas têm:
- **Row Level Security (RLS)** ativado
- Políticas que garantem que usuários só veem seus próprios dados
- Integração com `auth.users` do Supabase Auth

---

## 📝 Notas Importantes

1. **XP e Níveis:** O sistema de gamificação é interdependente - ao completar objetivos, hábitos ou pomodoros, XP é adicionado automaticamente.

2. **Progresso Automático:** A hierarquia de objetivos atualiza o progresso automaticamente baseado nas micro-tarefas completadas.

3. **Streaks:** O sistema de streaks de hábitos é inteligente - detecta se o streak continua, quebrou, ou se é um novo streak.

4. **Time Tracking:** O tempo gasto em tarefas/objetivos é calculado automaticamente a partir das sessões Pomodoro.

5. **Produtividade:** As estatísticas de produtividade incluem detecção de procrastinação baseada em pausas e sessões canceladas.

---

## 🧪 Testes Rápidos

Após executar as migrations, teste com:

```sql
-- Verificar se função de XP está funcionando
SELECT add_xp('seu-user-id-aqui', 50, 'test', 'Teste de XP');

-- Verificar nível do usuário
SELECT get_user_level('seu-user-id-aqui');

-- Verificar estatísticas de hábitos
SELECT * FROM habit_stats WHERE user_id = 'seu-user-id-aqui';

-- Verificar resumo diário de Pomodoros
SELECT * FROM daily_pomodoro_summary 
WHERE user_id = 'seu-user-id-aqui' 
ORDER BY date DESC 
LIMIT 7;
```

---

## 🔄 Atualizações

Para adicionar novas queries no futuro:
1. Crie arquivo `005_nome_descritivo.sql`
2. Atualize este README.md
3. Documente funções e triggers criados

---

**Última atualização:** 08/02/2026  
**Versão:** 1.0
