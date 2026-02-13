import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  streak?: number;
  xp?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  streak,
  xp,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="-ml-2 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-500"
            >
              <span className="material-symbols-rounded text-2xl">arrow_back</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-black text-slate-800">{title}</h1>
            {subtitle && <span className="text-xs font-medium text-slate-500">{subtitle}</span>}
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="flex items-center gap-2">
          {(streak !== undefined || xp !== undefined) && (
            <div className="mr-2 flex items-center gap-2">
              {streak !== undefined && streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1">
                  <span className="material-symbols-rounded text-sm text-orange-500">
                    local_fire_department
                  </span>
                  <span className="text-xs font-bold text-orange-600">{streak}</span>
                </div>
              )}
              {xp !== undefined && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                  <span className="material-symbols-rounded text-sm text-emerald-500">stars</span>
                  <span className="text-xs font-bold text-emerald-600">{xp}</span>
                </div>
              )}
            </div>
          )}
          {rightAction && <div className="flex items-center">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
};
