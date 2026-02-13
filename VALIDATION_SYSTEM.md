# SISTEMA DE VALIDAÇÃO E CORREÇÃO DE IDENTAÇÃO

## 🎯 Objetivo
Sistema automatizado para garantir identação perfeita e layout consistente em todos os componentes React + Tailwind CSS do projeto Focus.

## 📁 Arquivos Criados

### 1. Configurações do Editor
- **`.vscode/settings.json`** - Configurações do VS Code para formatação automática
- **`.eslintrc.json`** - Regras ESLint para identação e padrões React
- **`.prettierrc`** - Configuração Prettier para formatação consistente

### 2. Scripts de Automação
- **`scripts/lint-and-fix.js`** - Script principal de validação e correção
- **`scripts/visual-validation.js`** - Validação visual com Playwright MCP

### 3. Documentação e Templates
- **`CODING_GUIDELINES.md`** - Guia completo de padronização
- **`templates/ComponentTemplate.tsx`** - Template base para novos componentes

## 🚀 Como Usar

### Verificar e Corrigir Identação
```bash
# Verificar e corrigir automaticamente
npm run validate

# Apenas verificar (sem corrigir)
npm run validate:check

# Formatar com Prettier
npm run format

# Verificar formatação
npm run format:check

# Rodar ESLint
npm run lint

# Corrigir ESLint
npm run lint:fix
```

### Validação Visual com Playwright
```bash
# Validar layout em diferentes viewports
npm run visual:validate

# Rodar testes E2E
npm run test:e2e

# Abrir interface do Playwright
npm run test:e2e:ui
```

## 📏 Regras Aplicadas

### Identação de Código
- **2 espaços** (nunca tabs)
- **Máximo 100 caracteres** por linha
- **Aspas simples** para strings
- **Ponto-e-vírgula** obrigatório

### Layout Visual
- **Cards**: `flex flex-col` com `p-5` (20px)
- **Grid**: Responsivo (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- **Border radius**: `rounded-2xl` (16px)
- **Cores**: Tema claro apenas (sem `dark:`)
- **Espaçamento**: `gap-4` ou `gap-6`

### Estrutura de Mini-Cards
```
┌─────────────────────────┐
│ [Ícone]  Label          │  ← Header com ícone em container
│                         │
│ 123 dias                │  ← Valor alinhado na parte inferior
└─────────────────────────┘
```

## ✅ Checklist para Novos Componentes

- [ ] Usar template base (`templates/ComponentTemplate.tsx`)
- [ ] Indentação de 2 espaços
- [ ] Classes Tailwind organizadas por categoria
- [ ] Layout responsivo (mobile-first)
- [ ] Sem classes `dark:`
- [ ] Cards com `flex flex-col` e `p-5`
- [ ] Ícones em containers coloridos (`bg-*-100`)
- [ ] Valores alinhados com `mt-auto`
- [ ] Rodar `npm run validate` antes de commitar

## 🎨 Exemplo de Componente Bem Indentado

```tsx
// ✅ CORRETO
export const StatCard: React.FC<Props> = ({ label, value, icon, color }) => {
  return (
    <div className={cn(
      "flex flex-col",
      "p-5 gap-3",
      "bg-white rounded-2xl border border-slate-200",
      "shadow-sm hover:shadow-md transition-all duration-300"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", colors.light)}>
          <span className={cn("w-4 h-4", colors.text)}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-auto">
        <span className="text-3xl font-black text-slate-800">{value}</span>
      </div>
    </div>
  );
};

// ❌ INCORRETO
export const StatCard: React.FC<Props> = ({ label, value, icon, color }) => {
return (
<div className="p-5 bg-white rounded-2xl">
<div className="flex gap-2">
<span>{icon}</span>
<span>{label}</span>
</div>
<span>{value}</span>
</div>
);
};
```

## 🔧 Integração com OpenCode

Para garantir que o OpenCode sempre gere código bem indentado, adicione ao prompt:

```
Sempre que criar ou editar um arquivo .tsx:
1. Use indentação de 2 espaços
2. Organize classes Tailwind por categoria (layout, spacing, appearance, effects)
3. Siga o template em templates/ComponentTemplate.tsx
4. Garanta responsividade com classes sm:, md:, lg:
5. Não use classes dark:
6. Rode npm run format antes de finalizar
```

## 📊 Validação Contínua

### Pre-commit Hook (opcional)
Adicione ao `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run validate:check
if [ $? -ne 0 ]; then
  echo "❌ Validação falhou. Corrija os erros antes de commitar."
  exit 1
fi
```

### CI/CD Pipeline
```yaml
- name: Validate Code
  run: |
    npm run validate:check
    npm run test:e2e
```

## 🎉 Resultados

Com este sistema:
- ✅ Código sempre indentado corretamente
- ✅ Layout consistente em todas as páginas
- ✅ Responsividade garantida (mobile, tablet, desktop)
- ✅ Zero classes `dark:` indevidas
- ✅ Mini-cards com estrutura padronizada
- ✅ Build sempre funcionando

## 📚 Documentação Adicional

- [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - Guia completo
- [templates/ComponentTemplate.tsx](./templates/ComponentTemplate.tsx) - Template base
- [e2e/theme-validation.spec.ts](./e2e/theme-validation.spec.ts) - Testes de validação
