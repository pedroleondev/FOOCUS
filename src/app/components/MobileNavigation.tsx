import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Trophy, Target, Timer } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Início', icon: <Home className="h-6 w-6" />, path: '/' },
  { id: 'habits', label: 'Hábitos', icon: <Calendar className="h-6 w-6" />, path: '/habitos' },
  { id: 'gamification', label: 'Game', icon: <Trophy className="h-6 w-6" />, path: '/gamificacao' },
  {
    id: 'objectives',
    label: 'Objetivos',
    icon: <Target className="h-6 w-6" />,
    path: '/objetivos',
  },
  { id: 'focus', label: 'Foco', icon: <Timer className="h-6 w-6" />, path: '/foco' },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="safe-area-pb fixed right-0 bottom-0 left-0 z-50 border-t border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex h-full min-w-[56px] flex-1 flex-col items-center justify-center transition-all duration-200 ${
                active ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`relative rounded-2xl p-2 transition-all duration-200 ${
                  active ? 'bg-emerald-50' : ''
                }`}
              >
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                {active && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span
                className={`mt-0.5 text-[10px] font-bold transition-all duration-200 ${
                  active ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
