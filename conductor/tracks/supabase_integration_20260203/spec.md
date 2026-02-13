# Especificação: Integração com Supabase

## Objetivo
Transicionar a aplicação de um estado de protótipo (dados mockados) para uma aplicação real com persistência de dados utilizando Supabase.

## Escopo
1. **Schema do Banco de Dados:** Criar tabelas para Hábitos, Objetivos, Tarefas e Rotinas Diárias.
2. **Segurança (RLS):** Configurar Row Level Security para garantir que cada usuário acesse apenas seus próprios dados.
3. **Serviços de Dados:** Implementar o cliente Supabase no frontend e substituir as chamadas de dados mockados por chamadas reais.
4. **Sincronização:** Garantir que o Dashboard reflita os dados em tempo real do banco de dados.

## Requisitos Técnicos
- PostgreSQL (Supabase)
- Supabase JS SDK
- Row Level Security (RLS) habilitado em todas as tabelas.