
import React from 'react';
import { MOCK_HEATMAP } from '@/constants';

export const SuccessView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard de Sucesso</h1>
          <p className="text-slate-500 font-medium mt-1">Acompanhe sua consistência e progresso real.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
          {['Mensal', 'Trimestral', 'Anual'].map(p => (
            <button
key={p} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              p === 'Mensal' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'
            }`}
            >{p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Objetivos em Andamento', value: '12', change: '+2 novos este mês', percent: 70 },
          { label: 'Hábitos Atuais', value: '08', change: '100% hoje', percent: 85 },
          { label: 'Taxa de Sucesso Semanal', value: '92%', change: 'Meta: 90%', percent: 92 },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
              <p className={`text-[10px] font-black mt-3 flex items-center gap-1 ${i === 2 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {i < 2 && <span className="material-symbols-rounded text-sm filled">{i === 0 ? 'trending_up' : 'check_circle'}</span>}
                {stat.change}
              </p>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * stat.percent / 100)} className="text-emerald-500" strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-slate-800">{stat.percent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Histórico de Atividade</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Intensidade de conclusão de tarefas</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Menos</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(v => (
                  <div
key={v} className={`w-4 h-4 rounded-md ${
                    v === 0 ? 'bg-slate-50' : v === 1 ? 'bg-emerald-100' : v === 2 ? 'bg-emerald-300' : 'bg-emerald-500'
                  }`}
                  >
                  </div>
                ))}
              </div>
              <span>Mais</span>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-4">
             <div className="flex flex-col justify-between py-2 text-[10px] font-black text-slate-300 uppercase">
              <span>Seg</span>
              <span>Qua</span>
              <span>Sex</span>
             </div>
            <div className="grid grid-cols-12 gap-2">
              {MOCK_HEATMAP.map((d, i) => (
                <div
key={i} className={`aspect-square rounded-md transition-all duration-500 hover:scale-110 cursor-pointer ${
                  d.value === 0 ? 'bg-slate-50' : d.value === 1 ? 'bg-emerald-100' : d.value === 2 ? 'bg-emerald-200' : d.value === 3 ? 'bg-emerald-400' : 'bg-emerald-600'
                }`}
                >
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-1">Consistência</h3>
          <p className="text-sm text-slate-500 font-medium mb-12">Últimos 30 dias</p>
          
          <div className="relative h-48 flex items-end justify-between px-2">
            {[40, 60, 50, 80, 95, 85, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 max-w-[12px] bg-emerald-50 rounded-full group relative transition-all hover:bg-emerald-100" style={{ height: `${h}%` }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
              </div>
            ))}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
              <path d="M0,100 Q40,40 80,60 T160,20 T240,40 T320,10" fill="none" stroke="#10B981" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex justify-between mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <span>01 NOV</span>
            <span>15 NOV</span>
            <span>30 NOV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
