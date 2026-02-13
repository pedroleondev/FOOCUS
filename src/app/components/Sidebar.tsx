import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Target,
  BarChart3,
  Menu,
  Moon,
  Rocket
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Planejar', icon: Calendar, path: '/plano' },
  { label: 'Hábitos', icon: CheckCircle2, path: '/habitos' },
  { label: 'Foco', icon: PlayCircle, path: '/foco' },
  { label: 'Objetivos', icon: Target, path: '/objetivos' },
  { label: 'Sucesso', icon: BarChart3, path: '/sucesso' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary">
            <div className="bg-primary p-2 rounded-xl shadow-lg">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">FOCUS</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'fill-current')} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm">Tema</span>
          </Button>
          
          <div className="flex items-center gap-3 px-3 mt-4 pt-4 border-t">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              PL
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Pedro Leon</span>
              <span className="text-xs text-primary font-medium">Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Rocket className="w-6 h-6" />
            <span className="font-bold text-lg">FOCUS</span>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="min-w-[44px] min-h-[44px] w-11 h-11 touch-manipulation"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <Rocket className="w-5 h-5" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                        isActive 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'fill-current')} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Redesenhado para melhor UX */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t pb-safe z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            // Abreviações mais curtas para mobile
            const shortLabels: Record<string, string> = {
              'Dashboard': 'Home',
              'Planejar': 'Plan',
              'Hábitos': 'Háb',
              'Foco': 'Foco',
              'Objetivos': 'Obj'
            };
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] py-2 px-3 rounded-xl transition-all duration-200 touch-manipulation',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  isActive ? 'bg-primary/10' : ''
                )}
                >
                  <Icon 
                    className={cn(
                      'w-6 h-6',
                      isActive && 'fill-primary/20'
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn(
                  'text-[11px] font-medium leading-none',
                  isActive && 'font-semibold'
                )}
                >
                  {shortLabels[item.label] || item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
