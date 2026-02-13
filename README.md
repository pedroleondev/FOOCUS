<div align="center">
  <img width="600" src="https://s3.metagente360.cloud/pedroleondev/FOOCUS%20LOGO%20%281%29.png" alt="FOOCUS LOGO">
</div>

## 🚀 Executando Localmente

**Pré-requisitos:** Node.js, Conta no Supabase

1. **Instalar dependências:**
   `npm install`

2. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env.local` e adicione:
   ```env
   VITE_SUPABASE_URL=https://seu-id-do-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   GEMINI_API_KEY=sua-chave-gemini
   ```

3. **Rodar o app:**
   `npm run dev`

## 🗄️ Configuração do Banco de Dados Supabase

O projeto utiliza o Supabase para persistência de dados e Row Level Security (RLS).

### Configuração Inicial
1. **Instalar CLI do Supabase:** `npm install supabase --save-dev`
2. **Login no Supabase:** `npx supabase login`
3. **Vincular seu projeto:** `npx supabase link --project-ref <seu-id-do-projeto>`

### Schema e Migrações
1. **Aplicar o schema inicial:** `npx supabase db push`
2. **Gerar tipos TypeScript:**
   `npx supabase gen types typescript --linked > supabase_types.ts`

### Row Level Security (RLS)
O banco de dados está configurado com RLS por padrão. Certifique-se de que sua aplicação lida corretamente com a autenticação para permitir que os usuários acessem seus próprios dados.

## ☁️ Deploy em VPS (Portainer + Traefik)

Este projeto foi desenhado para ser executado em uma VPS utilizando Docker.

1. **Build do Container:** `docker build -t usuáriogithub/dockerhub/foocus-project .`
2. **Portainer:** Importe a stack utilizando o arquivo `docker-compose.yml`.
3. **Traefik:** [Recomendado para uso em VPS/Self-Hosted]Certifique-se de configurar as labels de roteamento para HTTPS automático.
