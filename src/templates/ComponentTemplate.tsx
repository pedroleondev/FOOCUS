/**
 * Template Base para Componentes React + Tailwind
 *
 * Este arquivo serve como referência para criar novos componentes
 * seguindo os padrões de identação e layout do projeto.
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// INTERFACES
// ============================================

interface ComponentTemplateProps {
  /** Título do card */
  title: string;
  /** Descrição opcional */
  description?: string;
  /** Valor principal a ser exibido */
  value?: number | string;
  /** Unidade do valor (ex: dias, %, vezes) */
  unit?: string;
  /** Ícone do Lucide React */
  icon?: React.ReactNode;
  /** Cor do tema (determina as cores do card) */
  color?: 'blue' | 'orange' | 'purple' | 'emerald' | 'teal';
  /** Variante do card */
  variant?: 'default' | 'outlined' | 'ghost';
  /** Callback de clique */
  onClick?: () => void;
  /** Conteúdo adicional */
  children?: React.ReactNode;
}

// ============================================
// CONSTANTES
// ============================================

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  orange: {
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  emerald: {
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  teal: {
    bg: 'bg-teal-500',
    light: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-200',
  },
} as const;

// ============================================
// COMPONENTE
// ============================================

export const ComponentTemplate: React.FC<ComponentTemplateProps> = ({
  title,
  description,
  value,
  unit = '',
  icon,
  color = 'emerald',
  variant = 'default',
  onClick,
  children,
}) => {
  const colors = COLOR_MAP[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        // Layout - Flex column para organização vertical
        'flex flex-col',
        // Spacing - Padding consistente
        'gap-3 p-5',
        // Appearance - Cores e bordas
        'rounded-2xl bg-white',
        // Border - Variantes
        variant === 'outlined' && `border-2 ${colors.border}`,
        variant === 'default' && 'border border-slate-200',
        // Shadow e efeitos
        'shadow-sm hover:shadow-md',
        // Transições
        'transition-all duration-300',
        // Interatividade
        onClick && 'cursor-pointer hover:-translate-y-0.5'
      )}
    >
      {/* Header com ícone e título */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn('rounded-xl p-2', colors.light)}>
            <span className={cn('h-5 w-5', colors.text)}>{icon}</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
        </div>
      </div>

      {/* Valor principal */}
      {value !== undefined && (
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800">{value}</span>
            {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
          </div>
        </div>
      )}

      {/* Conteúdo adicional */}
      {children}
    </div>
  );
};

// ============================================
// COMPONENTE DE GRID (Exemplo de Layout)
// ============================================

interface GridTemplateProps {
  children: React.ReactNode;
  /** Número de colunas em desktop */
  columns?: 1 | 2 | 3 | 4;
  /** Gap entre elementos */
  gap?: 'sm' | 'md' | 'lg';
}

export const GridTemplate: React.FC<GridTemplateProps> = ({
  children,
  columns = 4,
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid', colClasses[columns], gapClasses[gap])}>{children}</div>;
};

// ============================================
// COMPONENTE DE STATS (Mini-cards)
// ============================================

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: 'orange' | 'emerald' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit = '', icon, color }) => {
  const colors = COLOR_MAP[color];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-5">
      {/* Header com ícone em container */}
      <div className="mb-2 flex items-center gap-2">
        <div className={cn('rounded-lg p-1.5', colors.light)}>
          <span className={cn('h-4 w-4', colors.text)}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {label}
        </span>
      </div>

      {/* Valor alinhado na parte inferior */}
      <div className="mt-auto">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-800">{value}</span>
          {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE SEÇÃO (Container)
// ============================================

interface SectionTemplateProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const SectionTemplate: React.FC<SectionTemplateProps> = ({
  title,
  icon,
  action,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
      {/* Header da seção */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400">{icon}</span>}
          <h2 className="text-xs font-black tracking-widest text-slate-800 uppercase">{title}</h2>
        </div>
        {action}
      </div>

      {/* Conteúdo */}
      {children}
    </section>
  );
};

// ============================================
// EXEMPLOS DE USO
// ============================================

/*
// Exemplo 1: Card simples
<ComponentTemplate
  title="Hábitos"
  value={12}
  unit="dias"
  icon={<Target />}
  color="emerald"
/>

// Exemplo 2: Grid de stats
<GridTemplate columns={4} gap="md">
  <StatCard
    label="Atual"
    value={12}
    unit="dias"
    icon={<Flame />}
    color="orange"
  />
  <StatCard
    label="Recorde"
    value={21}
    unit="dias"
    icon={<TrendingUp />}
    color="emerald"
  />
</GridTemplate>

// Exemplo 3: Seção com conteúdo
<SectionTemplate
  title="Histórico Visual"
  icon={<Calendar />}
  action={<span className="text-[10px] font-bold text-slate-400">Últimos 30 dias</span>}
>
  <div className="flex flex-wrap gap-2">
    {history.map((active, i) => (
      <div
        key={i}
        className={cn(
          "w-4 h-4 rounded-md",
          active ? "bg-emerald-500" : "bg-slate-100"
        )}
      />
    ))}
  </div>
</SectionTemplate>
*/
