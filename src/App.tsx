import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { Sidebar } from '@/app/components/Sidebar';
import { MobileNavigation } from '@/app/components/MobileNavigation';
import { DashboardView } from '@/app/views/DashboardView';
import { PlanningView } from '@/app/views/PlanningView';
import { HabitsView } from '@/app/views/HabitsView';
import { HabitDetailView } from '@/app/views/HabitDetailView';
import { GoalsView } from '@/app/views/GoalsView';
import { ObjectivesView } from '@/app/views/ObjectivesView';
import { SuccessView } from '@/app/views/SuccessView';
import { FocoView } from '@/app/views/FocoView';
import { FloatingActionButton } from '@/app/components/FloatingActionButton';
import { AuthProvider } from '@/app/components/AuthProvider';
import { GamificationView } from '@/app/views/GamificationView';

const App: React.FC = () => {
  return (
    <HeroUIProvider>
      <Router>
        <AuthProvider>
          <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<DashboardView />} />
                <Route path="/foco" element={<FocoView />} />
                <Route path="/plano" element={<PlanningView />} />
                <Route path="/habitos" element={<HabitsView />} />
                <Route path="/habitos/:id" element={<HabitDetailView />} />
                <Route path="/objetivos" element={<ObjectivesView />} />
                <Route path="/objetivos/:id" element={<GoalsView />} />
                <Route path="/sucesso" element={<SuccessView />} />
                <Route path="/gamificacao" element={<GamificationView />} />
              </Routes>
            </main>

            {/* Mobile Navigation - hidden on desktop */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>

            {/* FAB - ajustado para mobile */}
            <FloatingActionButton />
          </div>
        </AuthProvider>
      </Router>
    </HeroUIProvider>
  );
};

export default App;
