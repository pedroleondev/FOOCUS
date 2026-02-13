# GUIA DE PADRONIZAÇÃO DE CÓDIGO - FOCUS APP

## 🎯 Princípios Fundamentais

1. **Identação Consistente**: Sempre 2 espaços, nunca tabs
2. **Responsividade Mobile-First**: Todas as telas devem funcionar em mobile
3. **Tema Claro**: Não usar classes `dark:` (tema escuro desativado)
4. **Componentização**: Cada componente deve ter responsabilidade única
5. **Performance**: Lazy loading para componentes pesados

## 📏 Regras de Identação

### TypeScript/React
```tsx
// ✅ CORRETO
export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(false);
  
  const handleClick = () => {
    setState(!state);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Título</h1>
    </div>
  );
};

// ❌ INCORRETO - Identação inconsistente
export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
const [state, setState] = useState(false);
  const handleClick = () => {
      setState(!state);
  };
return (
<div className="flex flex-col gap-4">
  <h1 className="text-xl font-bold">Título</h1>
</div>
);
};
```

### Tailwind CSS
```tsx
// ✅ CORRETO - Classes organizadas por categoria
className={cn(
  // Layout
  "flex flex-col gap-4",
  // Spacing
  "p-5 m-2",
  // Colors
  "bg-white text-slate-800",
  // Border
  "rounded-2xl border border-slate-200",
  // Shadow
  "shadow-sm hover:shadow-md",
  // Interactive
  "transition-all duration-300"
)}

// ❌ INCORRETO - Classes bagunçadas
className="p-5 bg-white shadow-sm flex flex-col gap-4 text-slate-800 border border-slate-200 m-2 rounded-2xl hover:shadow-md transition-all duration-300"
```

## 📱 Regras de Responsividade

### Grid Layouts
```tsx
// ✅ CORRETO - Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Conteúdo */}
</div>

// ❌ INCORRETO - Grid fixo sem responsividade
<div className="grid grid-cols-4 gap-4">
  {/* Quebra em mobile */}
</div>
```

### Cards
```tsx
// ✅ CORRETO - Card responsivo
<div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-sm">
  <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Título</h2>
</div>

// ❌ INCORRETO - Tamanhos fixos
<div className="bg-white p-8 rounded-2xl">
  <h2 className="text-2xl font-bold">Título</h2>
</div>
```

## 🎨 Padrões Visuais

### Cores
- **Background cards**: `bg-white` ou `bg-slate-50`
- **Texto primário**: `text-slate-800`
- **Texto secundário**: `text-slate-500`
- **Bordas**: `border-slate-200`
- **NUNCA usar classes dark:**

### Espaçamento
- **Padding padrão**: `p-4`, `p-5` ou `p-6`
- **Gap entre elementos**: `gap-4` ou `gap-6`
- **Border radius**: `rounded-2xl` para cards, `rounded-xl` para botões

### Tipografia
- **Títulos**: `font-black` ou `font-bold`
- **Labels**: `text-[10px] font-bold uppercase tracking-widest text-slate-400`
- **Dados**: `text-2xl` ou `text-3xl font-black`

## 🔧 Estrutura de Componentes

### Template Base
```tsx
import React from 'react';
import { cn } from '../lib/utils';

interface ComponentProps {
  title: string;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  children 
}) => {
  return (
    <div className={cn(
      // Layout
      "flex flex-col",
      // Spacing
      "p-5 gap-4",
      // Appearance
      "bg-white rounded-2xl border border-slate-200",
      // Effects
      "shadow-sm hover:shadow-md transition-all duration-300"
    )}>
      <h2 className="text-xl font-black text-slate-800">
        {title}
      </h2>
      {children}
    </div>
  );
};
```

### Estrutura de Arquivos
```
components/
  ComponentName/
    index.tsx          # Exportação principal
    ComponentName.tsx  # Componente
    types.ts           # Interfaces/Types
    utils.ts           # Funções auxiliares
    styles.ts          # Classes Tailwind (se necessário)
```

## ✅ Checklist de Validação

Antes de commitar, verifique:

- [ ] Indentação de 2 espaços em todo o arquivo
- [ ] Sem classes `dark:` no código
- [ ] Grid responsivo (mobile-first)
- [ ] Cards com padding consistente (`p-4`, `p-5` ou `p-6`)
- [ ] Bordas arredondadas padronizadas (`rounded-2xl`)
- [ ] Textos capitalizados corretamente
- [ ] Ícones em containers com background (`bg-*-100`)
- [ ] Testes passando: `npm test`
- [ ] Build funcionando: `npm run build`
- [ ] Lint sem erros: `npm run lint`

## 🚀 Scripts de Automação

```bash
# Verificar e corrigir identação
node scripts/lint-and-fix.js

# Verificar apenas (não corrige)
node scripts/lint-and-fix.js --check

# Verificar todos os arquivos
node scripts/lint-and-fix.js --all

# Validar com Playwright
npx playwright test e2e/theme-validation.spec.ts
```

## 📝 Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `HabitDetailView`)
- **Hooks**: camelCase com prefixo `use` (ex: `useAuth`)
- **Funções auxiliares**: camelCase (ex: `capitalizeText`)
- **Interfaces**: PascalCase com sufixo `Props` (ex: `HabitProps`)
- **Constants**: UPPER_SNAKE_CASE (ex: `FIXED_USER_ID`)

## 🎭 Ícones e Cores

### Mapa de Ícones por Contexto
- **Academia/Exercício**: `Dumbbell` (azul)
- **Leitura/Estudo**: `BookOpen` (roxo)
- **Meditação**: `Brain` (teal)
- **Água**: `Droplets` (ciano)
- **Progresso**: `TrendingUp` (esmeralda)
- **Fogo/Sequência**: `Flame` (laranja)

### Cores por Categoria
```tsx
const colorMap = {
  'academia': { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  'exercicio': { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  'leitura': { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  'meditacao': { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' },
  // ...etc
};
```

## 🐛 Debugging

Se encontrar problemas de identação:

1. Rode `npm run format` para corrigir automaticamente
2. Verifique no VS Code: Ctrl+Shift+P → "Format Document"
3. Confira se o Prettier está configurado no `.prettierrc`
4. Valide com ESLint: `npx eslint . --ext .ts,.tsx`

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Best Practices](https://react.dev/learn)
- [ESLint Rules](https://eslint.org/docs/rules)
- [Prettier Options](https://prettier.io/docs/en/options.html)
