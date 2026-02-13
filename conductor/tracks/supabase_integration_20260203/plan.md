# Plano de Implementação: Integração com Supabase

## Fase 1: Infraestrutura e Schema do Banco [checkpoint: 96188ab]

- [x] Task: Criar migrações SQL para as tabelas principais (habits, goals,
      tasks, routines)
- [x] Task: Configurar políticas de RLS (Row Level Security) para cada tabela
- [x] Task: Aplicar migrações ao projeto remoto do Supabase
- [x] Task: Conductor - User Manual Verification 'Infraestrutura e Schema do
      Banco' (Protocol in workflow.md)

## Fase 2: Configuração do Cliente e Tipagem [checkpoint: 76b4069]

- [x] Task: Gerar tipos TypeScript a partir do schema do Supabase
- [x] Task: Inicializar o cliente Supabase no projeto React
      (`services/supabaseClient.ts`)
- [x] Task: Conductor - User Manual Verification 'Configuração do Cliente e
      Tipagem' (Protocol in workflow.md)

## Fase 3: Migração de Dados e Refatoração de Views [checkpoint: f11783e]

- [x] Task: Refatorar `DashboardView.tsx` para buscar dados do Supabase
      (dd6a3ec)
- [x] Task: Refatorar `HabitsView.tsx` para CRUD de hábitos (f53e52c)
- [x] Task: Refatorar `PlanningView.tsx` para salvar planejamentos reais
      (df54979)
- [x] Task: Atualizar `README.md` com instruções de configuração do banco
      (a021c10)
- [x] Task: Conductor - User Manual Verification 'Migração de Dados e
      Refatoração de Views' (Protocol in workflow.md)
