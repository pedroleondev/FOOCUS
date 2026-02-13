import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

const WEEK_DAYS = [
  { name: 'Segunda-feira', date: 15, active: true },
  { name: 'Terça-feira', date: 16, active: false },
  { name: 'Quarta-feira', date: 17, active: false },
  { name: 'Quinta-feira', date: 18, active: false },
  { name: 'Sexta-feira', date: 19, active: false },
  { name: 'Sábado', date: 20, active: false },
  { name: 'Domingo', date: 21, active: false },
];

const PRIORITY_OPTIONS = [
  { title: 'Decidir o nome', goal: 'Marca de roupas' },
  { title: 'Decidir o estilo', goal: 'Marca de roupas' },
  { title: 'Pesquisa de mercado', goal: 'Marca de roupas' },
  { title: 'Criar a logo', goal: 'Marca de roupas' },
  { title: 'Procurar fornecedores', goal: 'Marca de roupas' },
];

interface FixedActivity {
  id: string;
  time: string;
  title: string;
}

export const PlanningView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1 State
  const [strategicVision, setStrategicVision] = useState('');

  // Step 2 State
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);
  const [priorityError, setPriorityError] = useState(false);

  // Step 3 State
  const [fixedActivities, setFixedActivities] = useState<FixedActivity[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');

  // Step 4 Mini-Modal State
  const [isMiniModalOpen, setIsMiniModalOpen] = useState(false);
  const [miniActivityTitle, setMiniActivityTitle] = useState('');
  const [miniActivityTime, setMiniActivityTime] = useState('');

  const handleOpenModal = () => {
    setModalStep(1);
    setIsModalOpen(true);
  };

  const nextStep = async () => {
    if (modalStep < 4) {
      setModalStep(modalStep + 1);
    } else {
      await handleFinalizePlanning();
    }
  };

  const handleFinalizePlanning = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      console.log('[PlanningView] User ID:', userId);
      console.log('[PlanningView] Selected priorities:', selectedPriorities);
      console.log('[PlanningView] Fixed activities:', fixedActivities);

      // 1. Save Priorities as Tasks
      if (selectedPriorities.length > 0) {
        const tasksToInsert = selectedPriorities.map(idx => ({
          user_id: userId,
          title: PRIORITY_OPTIONS[idx].title,
          category: PRIORITY_OPTIONS[idx].goal,
          completed: false,
        }));

        console.log('[PlanningView] Tasks to insert:', tasksToInsert);

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (tasksError) {
          console.error('[PlanningView] Tasks error:', tasksError);
          throw new Error(
            `Erro ao salvar tarefas: ${tasksError.message} (código: ${tasksError.code})`
          );
        }

        console.log('[PlanningView] Tasks saved successfully:', tasksData);
      }

      // 2. Save Fixed Activities as Daily Routines
      if (fixedActivities.length > 0) {
        const routinesToInsert = fixedActivities.map(act => ({
          user_id: userId,
          title: act.title,
          time_start: act.time.includes(':')
            ? act.time.length === 5
              ? `${act.time}:00`
              : act.time
            : `${act.time}:00:00`,
          duration: '1h',
          icon: 'event',
        }));

        console.log('[PlanningView] Routines to insert:', routinesToInsert);

        const { data: routinesData, error: routinesError } = await supabase
          .from('daily_routines')
          .insert(routinesToInsert)
          .select();

        if (routinesError) {
          console.error('[PlanningView] Routines error:', routinesError);
          throw new Error(
            `Erro ao salvar rotinas: ${routinesError.message} (código: ${routinesError.code})`
          );
        }

        console.log('[PlanningView] Routines saved successfully:', routinesData);
      }

      setIsModalOpen(false);
      // Reset state
      setStrategicVision('');
      setSelectedPriorities([]);
      setFixedActivities([]);
      alert('Planejamento salvo com sucesso!');
    } catch (error: unknown) {
      console.error('[PlanningView] Error saving planning:', error);
      alert(`Erro ao salvar planejamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const prevStep = () => {
    if (modalStep > 1) setModalStep(modalStep - 1);
  };

  const togglePriority = (idx: number) => {
    if (selectedPriorities.includes(idx)) {
      setSelectedPriorities(selectedPriorities.filter(id => id !== idx));
      setPriorityError(false);
    } else {
      if (selectedPriorities.length >= 3) {
        setPriorityError(true);
      } else {
        setSelectedPriorities([...selectedPriorities, idx]);
        setPriorityError(false);
      }
    }
  };

  const addFixedActivity = () => {
    if (newActivityTitle && newActivityTime) {
      const newAct = {
        id: Date.now().toString(),
        time: newActivityTime,
        title: newActivityTitle,
      };
      setFixedActivities([newAct, ...fixedActivities].sort((a, b) => a.time.localeCompare(b.time)));
      setNewActivityTitle('');
      setNewActivityTime('');
    }
  };

  const openMiniModal = (time: string) => {
    setMiniActivityTime(time);
    setMiniActivityTitle('');
    setIsMiniModalOpen(true);
  };

  const saveMiniActivity = () => {
    if (miniActivityTitle && miniActivityTime) {
      const newAct = {
        id: Date.now().toString(),
        time: miniActivityTime,
        title: miniActivityTitle,
      };
      setFixedActivities([newAct, ...fixedActivities].sort((a, b) => a.time.localeCompare(b.time)));
      setIsMiniModalOpen(false);
    }
  };

  const removeFixedActivity = (id: string) => {
    setFixedActivities(fixedActivities.filter(a => a.id !== id));
  };

  // Step 4: Hours generation
  const hours = Array.from({ length: 20 }, (_, i) => {
    const h = i + 5;
    return `${h.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="mx-auto max-w-7xl pb-24 md:pb-0">
      <header className="mb-12 flex flex-col items-center">
        <span className="mb-2 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          Semana
        </span>
        <div className="flex items-center gap-10">
          <button className="p-2 text-slate-400 transition-colors hover:text-emerald-500">
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">15 de dezembro</h1>
          <button className="p-2 text-slate-400 transition-colors hover:text-emerald-500">
            <span className="material-symbols-rounded">chevron_right</span>
          </button>
        </div>
        <button className="mt-4 flex items-center gap-2 text-slate-400 transition-colors hover:text-emerald-500">
          <span className="material-symbols-rounded text-lg">history</span>
          <span className="text-sm font-bold tracking-wider uppercase">Semana Atual</span>
        </button>
      </header>

      {/* Hero Empty State */}
      <div className="mb-10 rounded-[2.5rem] border border-slate-100 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-300">
          <span className="material-symbols-rounded text-4xl">calendar_month</span>
        </div>
        <h2 className="mb-3 text-2xl font-black text-slate-800">Semana sem planejamento</h2>
        <p className="mx-auto mb-10 max-w-sm font-medium text-slate-500">
          Esta semana ainda não possui um planejamento registrado. Organize suas metas e tarefas
          agora para manter o foco.
        </p>
        <button
          onClick={handleOpenModal}
          className="mx-auto flex transform items-center gap-3 rounded-full bg-emerald-500 px-10 py-4 font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-600 active:scale-95"
        >
          <span className="material-symbols-rounded">add</span>
          PLANEJAR SEMANA
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {WEEK_DAYS.map(day => (
          <div
            key={day.date}
            onClick={handleOpenModal}
            className={`group cursor-pointer rounded-[2rem] border bg-white p-8 shadow-sm transition-all duration-300 ${
              day.active
                ? 'border-emerald-500 ring-2 ring-emerald-50'
                : 'border-slate-100 hover:border-emerald-300'
            }`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p
                  className={`text-[10px] font-black tracking-widest uppercase ${day.active ? 'text-emerald-500' : 'text-slate-400'}`}
                >
                  {day.name}
                </p>
                <p
                  className={`text-4xl font-black tracking-tighter ${day.active ? 'text-slate-800' : 'text-slate-200'}`}
                >
                  {day.date}
                </p>
              </div>
              <button className="text-slate-200 transition-colors group-hover:text-emerald-500">
                <span className="material-symbols-rounded text-2xl">add_circle</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="h-2.5 w-full rounded-full bg-slate-50"></div>
              <div className="h-2.5 w-2/3 rounded-full bg-slate-50"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Planning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
          </div>
          <div className="animate-in zoom-in relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 p-8">
              <div>
                <h3 className="text-xl font-black text-slate-800">Segunda-feira, 15 de dezembro</h3>
                <span className="mt-1 inline-block text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                  Passo {modalStep} de 4
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-300 transition-colors hover:text-slate-600"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* STEP 1: VISÃO ESTRATÉGICA */}
            {modalStep === 1 && (
              <div className="animate-in fade-in max-h-[60vh] overflow-y-auto p-10 duration-500">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                    <span className="material-symbols-rounded text-3xl font-bold">psychology</span>
                  </div>
                  <h4 className="mb-2 text-xl font-black text-slate-800">Visão Estratégica</h4>
                  <p className="text-sm font-medium text-slate-500">
                    Responda antes de selecionar seus checkpoints
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-center text-base font-bold text-slate-700">
                    O que precisa avançar esta semana para meus objetivos não travarem?
                  </label>
                  <textarea
                    rows={4}
                    value={strategicVision}
                    onChange={e => setStrategicVision(e.target.value)}
                    placeholder="descreva o que precisa acontecer..."
                    className="w-full resize-none rounded-2xl border-slate-100 bg-slate-50 px-6 py-5 text-base font-medium shadow-inner transition-all outline-none placeholder:text-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  >
                  </textarea>
                </div>
              </div>
            )}

            {/* STEP 2: PRIORIDADES */}
            {modalStep === 2 && (
              <div className="animate-in slide-in-from-right-4 max-h-[60vh] overflow-y-auto p-10 duration-300">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-lg font-black text-slate-800">Prioridades do dia (máx. 3)</h4>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${selectedPriorities.length === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {selectedPriorities.length}/3 Selecionadas
                  </span>
                </div>
                <p className="mb-6 text-sm font-medium text-slate-500">
                  Selecione as atividades mais importantes para hoje.
                </p>

                {priorityError && (
                  <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <span className="material-symbols-rounded text-rose-500">error</span>
                    <p className="text-xs font-bold tracking-wider text-rose-600 uppercase">
                      Você já atingiu o limite de 3 prioridades.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {PRIORITY_OPTIONS.map((item, idx) => {
                    const isSelected = selectedPriorities.includes(idx);
                    const isDisabled = selectedPriorities.length >= 3 && !isSelected;
                    return (
                      <label
                        key={idx}
                        onClick={() => togglePriority(idx)}
                        className={`block cursor-pointer rounded-2xl border p-5 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-50'
                            : isDisabled
                              ? 'pointer-events-none border-slate-50 opacity-40 grayscale'
                              : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-rounded text-xs font-bold text-white">
                                check
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              {item.goal}
                            </p>
                            <p
                              className={`text-base font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}
                            >
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: ATIVIDADES SECUNDÁRIAS */}
            {modalStep === 3 && (
              <div className="animate-in slide-in-from-right-4 max-h-[60vh] overflow-y-auto p-10 duration-300">
                <h4 className="mb-1 text-lg font-black text-slate-800">Atividades secundárias</h4>
                <p className="mb-8 text-sm font-medium text-slate-500">
                  Tarefas para fazer após as prioridades do dia ou compromissos com horários fixos.
                </p>

                <div className="mb-8 space-y-4 rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-[3]">
                      <input
                        type="text"
                        value={newActivityTitle}
                        onChange={e => setNewActivityTitle(e.target.value)}
                        placeholder="Nome da atividade"
                        className="w-full rounded-2xl border-slate-100 bg-white px-6 py-4 text-sm font-bold transition-all outline-none placeholder:text-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="relative flex-[2]">
                      <span className="material-symbols-rounded absolute top-1/2 left-4 -translate-y-1/2 text-lg text-slate-300">
                        schedule
                      </span>
                      <input
                        type="time"
                        value={newActivityTime}
                        onChange={e => setNewActivityTime(e.target.value)}
                        className="w-full rounded-2xl border-slate-100 bg-white py-4 pr-4 pl-12 text-sm font-bold text-slate-700 transition-all outline-none focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      onClick={addFixedActivity}
                      className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
                    >
                      <span className="material-symbols-rounded font-bold transition-transform group-active:scale-90">
                        add
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {fixedActivities.map(act => (
                    <div
                      key={act.id}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-emerald-200"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="material-symbols-rounded text-lg">schedule</span>
                          <span className="text-sm font-black tracking-tight">{act.time}</span>
                        </div>
                        <span className="text-base font-bold text-slate-700">{act.title}</span>
                      </div>
                      <button
                        onClick={() => removeFixedActivity(act.id)}
                        className="p-2 text-slate-200 transition-colors hover:text-rose-500"
                      >
                        <span className="material-symbols-rounded text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: ROTINA DO DIA */}
            {modalStep === 4 && (
              <div className="animate-in slide-in-from-right-4 max-h-[60vh] overflow-y-auto p-10 duration-300">
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-black text-slate-800">Rotina do dia</h4>
                    <p className="text-sm font-medium text-slate-500">
                      Organize seus horários das 5h à meia-noite.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-emerald-500">
                    <span className="material-symbols-rounded text-lg">folder_open</span>
                    Carregar rotina
                  </button>
                </div>

                <div className="mt-8 space-y-1">
                  {hours.map(time => {
                    const scheduledAct = fixedActivities.find(a =>
                      a.time.startsWith(time.split(':')[0])
                    );

                    return (
                      <div key={time} className="group relative flex items-start gap-4 py-2">
                        <span className="w-12 pt-4 text-xs font-black text-slate-300 transition-colors group-hover:text-emerald-400">
                          {time}
                        </span>

                        <div className="flex-1">
                          {scheduledAct ? (
                            <div className="animate-in fade-in slide-in-from-left-2 flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm shadow-orange-100/50">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-orange-400">
                                  {scheduledAct.time}
                                </span>
                                <span className="text-sm font-bold text-orange-700">
                                  {scheduledAct.title}
                                </span>
                                <span className="text-[10px] font-medium text-orange-400/70">
                                  (1h)
                                </span>
                              </div>
                              <span className="material-symbols-rounded text-lg text-orange-300">
                                drag_indicator
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openMiniModal(time)}
                              className="group/btn flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-100 p-4 text-left text-xs font-bold text-slate-300 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:text-emerald-500"
                            >
                              <span>Clique para adicionar +</span>
                              <span className="material-symbols-rounded text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 group-hover/btn:text-emerald-300">
                                add
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-start gap-4 py-2 opacity-50">
                    <span className="w-12 pt-4 text-xs font-black text-slate-300">00:00</span>
                    <div className="flex-1 rounded-2xl border border-dashed border-slate-100 p-4 text-xs font-bold text-slate-200">
                      Meia-noite
                    </div>
                  </div>
                </div>

                {/* Mini-Modal Contextual para Adição Rápida */}
                {isMiniModalOpen && (
                  <div className="animate-in fade-in fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/10 p-6 backdrop-blur-sm duration-200">
                    <div className="animate-in zoom-in w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-8 shadow-2xl duration-300">
                      <h5 className="mb-6 text-lg font-black text-slate-800">Nova Atividade</h5>

                      <div className="mb-8 space-y-4">
                        <div>
                          <label className="mb-2 ml-1 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Descrição
                          </label>
                          <input
                            type="text"
                            autoFocus
                            value={miniActivityTitle}
                            onChange={e => setMiniActivityTitle(e.target.value)}
                            placeholder="Ex: Reunião estratégica"
                            className="w-full rounded-2xl border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 transition-all outline-none focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 ml-1 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Horário
                          </label>
                          <div className="relative">
                            <span className="material-symbols-rounded absolute top-1/2 left-4 -translate-y-1/2 text-lg text-slate-300">
                              schedule
                            </span>
                            <input
                              type="time"
                              value={miniActivityTime}
                              onChange={e => setMiniActivityTime(e.target.value)}
                              className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 pr-4 pl-12 text-sm font-bold text-slate-700 outline-none focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsMiniModalOpen(false)}
                          className="flex-1 rounded-2xl py-4 text-xs font-black tracking-widest text-slate-400 uppercase transition-colors hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveMiniActivity}
                          className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumo de Prioridades não alocadas */}
                <div className="mt-10 rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
                  <h5 className="mb-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Prioridades a Encaixar
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPriorities.map(idx => (
                      <div
                        key={idx}
                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/10 transition-transform hover:scale-105"
                      >
                        <span className="material-symbols-rounded filled text-sm">
                          check_circle
                        </span>
                        {PRIORITY_OPTIONS[idx].title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between bg-slate-50 p-8">
              <button
                onClick={prevStep}
                disabled={isSaving}
                className="text-sm font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-600 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={nextStep}
                disabled={isSaving}
                className="flex items-center gap-3 rounded-full bg-emerald-500 px-10 py-4 font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSaving ? 'SALVANDO...' : modalStep === 4 ? 'FINALIZAR' : 'CONTINUAR'}
                <span className="material-symbols-rounded">
                  {modalStep === 4 ? 'check' : 'chevron_right'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
