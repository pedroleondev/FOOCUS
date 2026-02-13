import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { MobileHeader } from '../components/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Flame, Target, Zap, Award, ChevronRight } from 'lucide-react';

export const GamificationView: React.FC = () => {
  const { userStats, achievements, dailyQuests, levelInfo, loading } = useGamification();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const completedQuests = dailyQuests.filter(q => q.completed).length;
  const totalQuests = dailyQuests.length;
  const questProgress = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <MobileHeader title="Progresso" subtitle="Suas conquistas" />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Card Principal - Nível e XP */}
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Nível {levelInfo?.level}</p>
                <h2 className="text-2xl font-black">{levelInfo?.title}</h2>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">{userStats?.total_xp || 0} XP</span>
                <span className="text-emerald-100">
                  {levelInfo?.xpForNext
                    ? `${levelInfo.xpForNext - ((userStats?.total_xp || 0) - levelInfo.xpRequired)} XP para nível ${levelInfo.level + 1}`
                    : 'Nível máximo!'}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${levelInfo?.progress || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Streak</p>
                <p className="text-xl font-black">{userStats?.current_streak || 0} dias</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Conquistas</p>
                <p className="text-xl font-black">{achievements.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Missões do Dia */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base font-bold tracking-wider text-slate-600 uppercase">
                  Missões do Dia
                </CardTitle>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {completedQuests}/{totalQuests}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={questProgress} className="h-2" />

            <div className="space-y-3">
              {dailyQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    quest.completed ? 'border border-emerald-200 bg-emerald-50' : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      quest.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {quest.completed ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">
                        {quest.current_count}/{quest.target_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${quest.completed ? 'text-emerald-700' : 'text-slate-700'}`}
                    >
                      {quest.quest_type === 'complete_habits' && 'Complete 3 hábitos'}
                      {quest.quest_type === 'complete_objectives' && 'Complete 1 objetivo'}
                      {quest.quest_type === 'maintain_streak' && 'Mantenha sua streak'}
                    </p>
                    <p className="text-xs text-slate-500">+{quest.xp_reward} XP</p>
                  </div>
                  {quest.completed && (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600">
                      Feito!
                    </span>
                  )}
                </div>
              ))}

              {dailyQuests.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500">
                  Nenhuma missão disponível hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base font-bold tracking-wider text-slate-600 uppercase">
                  Conquistas
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-emerald-600">
                Ver todas <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {achievements.slice(0, 4).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center rounded-xl bg-slate-50 p-3 text-center"
                >
                  <span className="mb-2 text-3xl">{achievement.badge_icon}</span>
                  <p className="text-xs leading-tight font-bold text-slate-700">
                    {achievement.badge_name}
                  </p>
                  <span
                    className={`mt-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                      achievement.rarity === 'legendary'
                        ? 'bg-purple-100 text-purple-600'
                        : achievement.rarity === 'epic'
                          ? 'bg-orange-100 text-orange-600'
                          : achievement.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                </div>
              ))}

              {achievements.length === 0 && (
                <div className="col-span-4 py-6 text-center text-slate-500">
                  <Award className="mx-auto mb-2 h-12 w-12 opacity-30" />
                  <p className="text-sm">Nenhuma conquista ainda</p>
                  <p className="text-xs">Complete tarefas para desbloquear!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dicas de Progresso */}
        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold">Dica do dia</h3>
                <p className="text-sm leading-relaxed text-indigo-100">
                  Complete seus hábitos pela manhã para ganhar bônus de streak! Consistência é a
                  chave para subir de nível.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
