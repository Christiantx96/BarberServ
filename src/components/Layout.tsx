import { ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  LayoutDashboard, Users, Calendar, CreditCard, Settings, 
  LogOut, Menu, X, Scissors, Bell, ShoppingBag, 
  Clock, Package, Star
} from 'lucide-react';
import { cn } from './ui/Button';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agendamentos', label: 'Agendamentos', icon: Calendar },
    { path: '/financeiro', label: 'Financeiro', icon: CreditCard },
    { path: '/barbeiros', label: 'Barbeiros', icon: Users },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/servicos', label: 'Serviços', icon: Scissors },
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/expedientes', label: 'Expedientes', icon: Clock },
    { path: '/assinaturas', label: 'Assinaturas', icon: Star },
    { path: '/planos', label: 'Planos', icon: Settings },
    { path: '/perfil', label: 'Meu Perfil', icon: Settings },
  ];

  const customerNavItems = [
    { path: '/cliente/agendamentos', label: 'Meus Agendamentos', icon: Calendar },
    { path: '/perfil', label: 'Meu Perfil', icon: Settings },
  ];

  const navItems = user?.role === 'customer' ? customerNavItems : adminNavItems;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#f0e8d8] font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* Main Container */}
      <div className="relative flex h-screen flex-col transition-all duration-500">
        <div className="flex flex-1 flex-col overflow-hidden bg-[#14100c]/90 backdrop-blur-3xl md:border-amber-500/10">
          
          {/* Top Bar (macOS style on desktop, simple on mobile) */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-amber-500/10 bg-[#120e0a]/95 px-4 md:h-10 md:px-3 relative z-50">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 mr-4">
                <button 
                  onClick={handleLogout}
                  title="Sair"
                  className="h-3 w-3 rounded-full bg-red-500 shadow-sm shadow-red-500/20 hover:brightness-125 transition-all active:scale-95" 
                />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  title="Minimizar (Recolher Menu)"
                  className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20 hover:brightness-125 transition-all active:scale-95" 
                />
                <button 
                  onClick={toggleFullScreen}
                  title="Tela Cheia"
                  className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 hover:brightness-125 transition-all active:scale-95" 
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20">
                  <Scissors className="h-4 w-4" />
                </div>
                <span className="font-bold text-amber-400 md:hidden">{settings?.barbershop_name || 'BarberServ'}</span>
              </div>
            </div>

            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-amber-100/50">
              {settings?.barbershop_name || 'BarberServ'} — {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/10 bg-white/5 text-amber-100/70 hover:bg-white/10 hover:text-amber-50 transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-amber-500/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-amber-50">{user?.name}</span>
                  <button onClick={handleLogout} className="text-[10px] text-red-400 hover:text-red-300">Sair</button>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-400 text-xs font-bold text-black">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <button 
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/10 bg-white/5 text-amber-100/70"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Horizontal Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto border-b border-amber-500/10 bg-[#0e0b07]/95 backdrop-blur-xl px-4 py-2 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all whitespace-nowrap",
                    isActive 
                      ? "bg-amber-500/10 text-amber-400" 
                      : "text-amber-100/60 hover:bg-white/5 hover:text-amber-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <nav className={cn(
            "absolute inset-x-0 top-14 z-40 flex flex-col bg-[#0e0b07]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden border-b border-amber-500/10",
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-[150%]"
          )}>
            <div className="flex flex-1 flex-col gap-1 p-3 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-amber-500/10 text-amber-400" 
                        : "text-amber-100/60 hover:bg-white/5 hover:text-amber-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="mt-4 pt-4 border-t border-amber-500/10">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#14100c]/50">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

