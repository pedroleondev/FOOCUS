# FOOCUS - SaaS de Produtividade Pessoal

O FOOCUS é uma plataforma de produtividade projetada para ajudar usuários a gerenciarem seus hábitos, rotinas diárias e objetivos de longo prazo. O sistema utiliza Inteligência Artificial para decompor metas complexas em tarefas acionáveis e oferece uma interface visual rica para acompanhamento de progresso.

## 🚀 Tecnologias Principais

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **Roteamento:** React Router (HashRouter)
- **IA:** @google/genai (Utilizando o modelo `gemini-3-flash-preview`)
- **Estilização:** Tailwind CSS (Customizado)
- **Ícones:** Google Material Symbols
- **Backend (Planejado):** Supabase (referenciado em `foocus_supabase.zip`)

## 🏗️ Arquitetura e Estrutura

- `components/`: Contém as visões principais da aplicação (`DashboardView`, `PlanningView`, `HabitsView`, etc.).
- `services/`: Abstração de serviços externos, como a integração com o Gemini API.
- `types.ts`: Definições globais de interfaces TypeScript (`Habit`, `Goal`, `Task`, `DailyRoutine`).
- `constants.tsx`: Armazena cores do sistema e dados mockados para desenvolvimento e prototipagem rápida.

## 🛠️ Comandos de Desenvolvimento

- **Instalar Dependências:** `npm install`
- **Rodar Localmente:** `npm run dev` (Porta padrão: 3000)
- **Build de Produção:** `npm run build`
- **Preview do Build:** `npm run preview`

> **Nota:** É necessário configurar a variável `GEMINI_API_KEY` no arquivo `.env.local` para o funcionamento das ferramentas de IA.

## 🧠 Integração com IA (Gemini)

A aplicação utiliza o Gemini para:
- **Breakdown de Objetivos:** O serviço `breakdownGoal` em `services/geminiService.ts` transforma um objetivo macro em 5 tarefas práticas e sequenciais no formato JSON, otimizando a criação de MVPs ou planos de ação.

## 📝 Convenções de Desenvolvimento

- **Componentes:** Utiliza componentes funcionais com TypeScript.
- **Estilização:** Segue um padrão de design moderno com bordas arredondadas generosas (`rounded-[2rem]`), sombras suaves e cores vibrantes para feedbacks (Emerald para sucesso, Orange para fogo/sequência).
- **Dados:** Atualmente utiliza dados mockados centralizados em `constants.tsx` para facilitar a iteração na UI sem dependência direta de um backend ativo.
- **Roteamento:** Utiliza `HashRouter` para compatibilidade de deploy em ambientes estáticos.

---
*Gerado automaticamente para o contexto do Gemini CLI em 3 de Fevereiro de 2026.*
