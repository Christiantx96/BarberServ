import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { api } from '../services';
import { Appointment, Barber, Customer, Payment } from '../services/types';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [dateStr, setDateStr] = useState('');
  const [stats, setStats] = useState({
    revenue: 'R$ 0,00',
    customers: '0',
    todayAppts: '0',
    rating: '5.0'
  });
  const [todayAgenda, setTodayAgenda] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    setDateStr(today.toLocaleDateString('pt-BR', options));

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const todayISO = today.toISOString().split('T')[0];
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const [appts, custs, barbs, payments, reviews] = await Promise.all([
          api.getAppointments(),
          api.getCustomers(),
          api.getBarbers(),
          api.getPayments(),
          api.getReviews()
        ]);

        // Monthly Stats for Goals
        const monthlyPayments = payments.filter(p => {
          const pDate = new Date(p.paid_at);
          return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        });
        
        const monthlyAppts = appts.filter(a => {
          const aDate = new Date(a.date);
          return aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear && a.status === 'completed';
        });

        const newCustsThisMonth = custs.filter(c => {
          const cDate = new Date(c.createdAt);
          return cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear;
        });

        const revenueTotal = payments.reduce((acc, curr) => acc + curr.amount, 0);
        const monthlyRevenue = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);
        const todayApptsCount = appts.filter(a => a.date === todayISO).length;
        
        // Average Rating
        const avgRating = reviews.length > 0 
          ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
          : '5.0';

        setStats({
          revenue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueTotal),
          customers: custs.length.toString(),
          todayAppts: todayApptsCount.toString(),
          rating: avgRating
        });

        // Set Real Progress Goals (Example targets: 100 appts, R$ 5000 revenue, 20 new customers)
        const apptGoal = 100;
        const revenueGoal = 5000;
        const custGoal = 20;

        setGoals({
          apptProgress: Math.min(Math.round((monthlyAppts.length / apptGoal) * 100), 100),
          revenueProgress: Math.min(Math.round((monthlyRevenue / revenueGoal) * 100), 100),
          custProgress: Math.min(Math.round((newCustsThisMonth.length / custGoal) * 100), 100)
        });

        setTodayAgenda(appts.filter(a => a.date === todayISO).slice(0, 5));
        setBarbers(barbs.slice(0, 5));

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const [goals, setGoals] = useState({
    apptProgress: 0,
    revenueProgress: 0,
    custProgress: 0
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Visão Geral</h1>
          <p className="mt-1 text-sm text-amber-100/50 capitalize">
            Bem-vindo, {user?.name} — {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <CalendarIcon className="h-4 w-4" />
            Hoje
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Faturamento Total" value={stats.revenue} trend="Dados reais Supabase" icon="💰" color="amber" />
        <StatCard title="Clientes" value={stats.customers} trend="Total na base" icon="👤" color="yellow" />
        <StatCard title="Agendamentos Hoje" value={stats.todayAppts} trend="Planejado para hoje" icon="📅" color="orange" />
        <StatCard title="Avaliação Média" value={stats.rating} trend="Média de feedbacks" icon="⭐" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-amber-50">Desempenho Comercial</h3>
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              <button className="rounded-md bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">6M</button>
              <button className="rounded-md px-3 py-1 text-xs font-medium text-amber-100/50 hover:text-amber-50">1A</button>
            </div>
          </div>
          <div className="flex h-32 items-end gap-2">
            {[50, 66, 44, 80, 88, 60, 74, 58, 84, 96, 70, 82].map((h, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-sm transition-all group-hover:bg-amber-500/40 ${h > 85 ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-amber-500/20'}`}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-amber-100/40">
            <span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span>
            <span>Out</span><span>Nov</span><span>Dez</span><span>Jan</span><span>Fev</span><span>Mar</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 p-5 shadow-lg backdrop-blur-xl">
            <h3 className="mb-4 font-semibold text-amber-50">Metas do Mês</h3>
            <div className="flex flex-col gap-4">
              <ProgressBar label="Atendimentos (Concluídos)" percentage={goals.apptProgress} color="bg-amber-500" />
              <ProgressBar label="Faturamento" percentage={goals.revenueProgress} color="bg-amber-500" />
              <ProgressBar label="Novos Clientes" percentage={goals.custProgress} color="bg-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-500/10 p-5">
            <h3 className="font-semibold text-amber-50">Agenda de Hoje</h3>
            <Button variant="secondary" size="sm">Ver tudo</Button>
          </div>
          <div className="flex flex-col min-h-[100px]">
            {isLoading ? (
               <div className="p-10 text-center text-amber-100/30 text-sm">Carregando agenda...</div>
            ) : todayAgenda.length === 0 ? (
               <div className="p-10 text-center text-amber-100/30 text-sm">Nenhum agendamento para hoje.</div>
            ) : (
              todayAgenda.map(appt => (
                <AgendaItem 
                  key={appt.id}
                  time={appt.time.substring(0, 5)} 
                  name={appt.status === 'blocked' ? 'Bloqueado' : 'Cliente'} 
                  service={appt.status === 'blocked' ? '-' : 'Serviço'} 
                  status={appt.status === 'confirmed' ? 'Confirmado' : 'Pendente'} 
                  value="-" 
                  initials="?" 
                />
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-500/10 p-5">
            <h3 className="font-semibold text-amber-50">Barbeiros</h3>
          </div>
          <div className="flex flex-col min-h-[100px]">
            {isLoading ? (
               <div className="p-10 text-center text-amber-100/30 text-sm">Carregando...</div>
            ) : barbers.length === 0 ? (
               <div className="p-10 text-center text-amber-100/30 text-sm">Nenhum barbeiro cadastrado.</div>
            ) : (
              barbers.map(barber => (
                <BarberItem key={barber.id} name={barber.name} count="Ativo" rating="4.9" initials={barber.name.substring(0, 2).toUpperCase()} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: any) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/10 bg-[#14100c]/80 p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-500/30">
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-${color}-500 to-transparent opacity-50`} />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100/50">{title}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-sm">{icon}</div>
      </div>
      <div className="mb-1 text-2xl font-bold tracking-tight text-amber-50">{value}</div>
      <div className="text-xs font-medium text-emerald-500">{trend}</div>
    </div>
  );
}

function ProgressBar({ label, percentage, color }: any) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-amber-100/70">{label}</span>
        <span className="font-bold text-amber-400">{percentage}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-amber-500/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function AgendaItem({ time, name, service, status, value, initials, color = "from-amber-500 to-amber-400" }: any) {
  return (
    <div className="flex items-center gap-4 border-b border-amber-500/5 p-4 transition-colors hover:bg-amber-500/5 last:border-0">
      <div className="w-10 shrink-0 font-bold text-amber-400">{time}</div>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-black`}>
        {initials}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-amber-50">{name}</div>
        <div className="text-xs text-amber-100/50">{service}</div>
      </div>
      <div className="hidden sm:block">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${status === 'Confirmado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
          {status}
        </span>
      </div>
      <div className="font-bold text-amber-400">{value}</div>
    </div>
  );
}

function BarberItem({ name, count, rating, initials, color = "from-amber-500 to-amber-400" }: any) {
  return (
    <div className="flex items-center gap-3 border-b border-amber-500/5 p-4 transition-colors hover:bg-amber-500/5 last:border-0">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-black`}>
        {initials}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-amber-50">{name}</div>
        <div className="text-xs text-amber-100/50">{count}</div>
      </div>
      <div className="text-xs font-medium text-amber-400">★ {rating}</div>
    </div>
  );
}
