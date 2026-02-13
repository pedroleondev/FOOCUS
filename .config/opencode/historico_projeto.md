# Contexto Completo - Projeto FOOCUS

## Data de Atualização

Última atualização: Fevereiro 2026

---

## Visão Geral do Projeto

**FOOCUS** é uma aplicação de produtividade e acompanhamento de metas com
backend em Supabase, construída em React + TypeScript + Vite. O projeto está
implantado em `https://foocus.metagente360.cloud/`.

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript 5
- **Build**: Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **IA**: Gemini API
- **Deploy**: Docker + Traefik

---

## Histórico de Implementações

### ✅ 1. Infraestrutura de Deploy

#### Docker Setup Criado

Local: Raiz do projeto

- **`Dockerfile`**: Multi-stage build (Node + Nginx)
- **`docker-compose.yaml`**: Configuração Traefik para foocus.metagente360.cloud
- **`nginx.conf`**: Otimizado para React SPA

#### Deploy Automatizado

Local: `C:\tools\deploy-traefik\`

- **`deploy-traefik.bat`**: Script principal de deploy
- **`config.json`**: Configuração global com credenciais Supabase/Gemini
- **`templates/`**: Templates para Dockerfile, nginx.conf, docker-compose.yaml
- **`install.bat`**: Adiciona ferramenta ao PATH do Windows

**Comando de uso**: `deploy-traefik` (executar a partir do diretório do projeto)

**Resultado**: Imagem publicada em Docker Hub `pedroleonpython/foocus:latest`

---

### 📋 2. Tracks de Desenvolvimento Criadas

Local: `conductor/tracks/`

#### Track 1: Mobile-First Redesign (mobile_first_redesign_20260208)

**Status**: Planejado

**Funcionalidades**:

- Redesign completo mobile-first da UI
- Sistema de gamificação (XP, níveis 1-20, conquistas, missões diárias)
- Hierarquia de objetivos: Objetivos → Sub-objetivos → Micro-tarefas
- Tracker de hábitos melhorado com streaks e check-ins
- Decomposição e distribuição de tarefas via IA

**Arquivos**:

- `metadata.json` - Metadados do track
- `index.md` - Índice e visão geral
- `plan.md` - Plano detalhado de implementação
- `spec.md` - Especificações técnicas

#### Track 2: Pomodoro Time Tracking (pomodoro_time_tracking_20260208)

**Status**: Planejado

**Funcionalidades**:

- Sistema Pomodoro completo (25/5/15 min)
- Rastreamento de tempo por tarefa/objetivo
- Algoritmo de detecção de procrastinação
- Dashboard de produtividade com gráficos
- Suporte a timer em background

**Arquivos**:

- `metadata.json`
- `index.md`
- `plan.md`
- `spec.md`

---

### 🗄️ 3. Migrações SQL Preparadas

Local: `conductor/queries/`

#### 001_gamification_system.sql

**Cria**:

- `user_stats` (XP, nível, streaks)
- `achievements` (badges/conquistas)
- `xp_history` (histórico de transações XP)
- `daily_quests` (missões diárias)
- `level_thresholds` (níveis 1-20)

**Funções**:

- `add_xp()` - Adiciona XP e verifica level up
- `get_user_level()` - Obtém nível atual do usuário

#### 002_objectives_hierarchy.sql

**Cria**:

- `objectives` (objetivos principais com progresso)
- `sub_objectives` (metas intermediárias)
- `micro_tasks` (tarefas acionáveis)

**Funções**:

- `complete_objective()` - Completa objetivo e distribui XP
- `complete_micro_task()` - Completa micro-tarefa
- Triggers de cálculo automático de progresso

#### 003_habit_tracker_enhanced.sql

**Cria**:

- `habit_checkins` (check-ins diários)
- `habit_streaks` (histórico de streaks)

**Modifica**:

- Adiciona colunas à tabela `habits`: icon, color, streak_count, best_streak,
  xp_reward

**Funções**:

- `checkin_habit()` - Realiza check-in
- `undo_checkin()` - Desfaz check-in
- `get_habit_checkins_month()` - Obtém check-ins do mês

**Views**:

- `habit_stats` - Estatísticas consolidadas

**Nota Importante**: Corrigido problema de nome de coluna - usa `title` (não
`name`) para corresponder ao schema existente.

#### 004_pomodoro_time_tracking.sql

**Cria**:

- `pomodoro_sessions` (sessões de timer)
- `time_entries` (rastreamento contínuo)
- `productivity_stats` (métricas cacheadas)
- `pomodoro_configs` (configurações do usuário)

**Funções**:

- `complete_pomodoro_session()` - Completa sessão Pomodoro
- `calculate_daily_stats()` - Calcula estatísticas diárias
- `get_objective_time_spent()` - Obtém tempo gasto em objetivo

**Views**:

- `daily_pomodoro_summary` - Resumo diário

---

## Credenciais e Configurações

### Supabase

**URL**: `https://qezagogqrdjzvlggaaxv.supabase.co` **Anon Key**:
`sb_publishable_<redacted>`

_Armazenadas em_: `.env.local`

### Docker Hub

**Repositório**: `pedroleonpython/foocus` **Imagem**:
`pedroleonpython/foocus:latest`

---

## Próximos Passos

### Prioridade Alta

1. **Executar migrações SQL no Supabase**
   - Acessar SQL Editor do Supabase
   - Executar em ordem: 001 → 002 → 003 → 004
   - Arquivos localizados em: `conductor/queries/`

2. **Iniciar implementação Mobile-First**
   - Criar wireframes/Figma para UI mobile
   - Desenvolver componente `MobileNavigation` (navegação inferior)
   - Refatorar views existentes para abordagem mobile-first

### Prioridade Média

3. **Implementar Sistema de Gamificação**
   - Criar hook `useGamification`
   - Construir sistema de XP/Nível
   - Criar UI de conquistas/badges
   - Sistema de missões diárias

4. **Implementar Sistema Pomodoro**
   - Criar Web Worker para timer
   - Desenvolver componente `PomodoroTimer`
   - Criar widget persistente
   - Integrar rastreamento de tempo

---

## Problemas Conhecidos e Correções

### Schema de Banco de Dados

✅ **Resolvido**: Tabela `habits` usa coluna `title` (não `name`)

- Correção aplicada em `003_habit_tracker_enhanced.sql`

### Deploy

✅ **Implementado**: Sistema de deploy automatizado com Docker + Traefik

---

## Estrutura de Diretórios

```
FOOCUS/
├── .config/
│   └── opencode/
│       └── historico_projeto.md  ← (este arquivo)
├── conductor/
│   ├── queries/          ← Migrações SQL
│   ├── tracks/           ← Tracks de desenvolvimento
│   └── tracks.md         ← Lista de tracks
├── src/                  ← Código fonte React
├── public/               ← Assets públicos
├── Dockerfile            ← Config Docker
├── docker-compose.yaml   ← Config Traefik
├── nginx.conf            ← Config Nginx
└── package.json
```

---

## Comandos Úteis

### Desenvolvimento

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Deploy

```bash
deploy-traefik       # Deploy automatizado (a partir da raiz do projeto)
```

---

## Notas para Continuidade

Quando retornar ao projeto:

1. Verificar se migrações SQL foram executadas no Supabase
2. Revisar arquivos de track em `conductor/tracks/` para contexto
3. Executar `npm run dev` para iniciar ambiente de desenvolvimento
4. Verificar `.env.local` para credenciais
5. Executar `deploy-traefik` se necessário fazer deploy

---

**Projeto mantido por**: FOOCUS Team **Última sessão**: Fevereiro 2026
