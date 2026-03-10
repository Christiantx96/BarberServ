import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Appointment, Barber, Service, Schedule } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, Scissors, User } from 'lucide-react';

export function CustomerAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking state
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [apptsData, barbData, servData, schData] = await Promise.all([
        api.getAppointments(),
        api.getBarbers(),
        api.getServices(),
        api.getSchedules()
      ]);
      
      // Filter appointments for the current user
      const myAppts = apptsData.filter(a => a.customer_id === user?.id);
      // Sort by date and time descending
      setAppointments(myAppts.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()));
      
      setBarbers(barbData.filter(b => b.status === 'active'));
      setServices(servData.filter(s => s.active));
      setSchedules(schData.filter(s => s.is_active));
    } catch (error) {
      toast('Erro ao carregar dados', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Calculate available times when barber, service, or date changes
  useEffect(() => {
    if (!selectedBarber || !selectedService || !selectedDate) {
      setAvailableTimes([]);
      return;
    }

    const calculateAvailableTimes = async () => {
      const dateObj = new Date(selectedDate);
      // getDay() returns 0 for Sunday, 1 for Monday, etc.
      // Note: new Date('YYYY-MM-DD') parses as UTC, which might shift the day depending on timezone.
      // To be safe with local dates:
      const [year, month, day] = selectedDate.split('-');
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
      const dayOfWeek = localDate.getDay();

      // Find barber's schedule for this day
      const schedule = schedules.find(s => s.barber_id === selectedBarber && s.day_of_week === dayOfWeek);
      
      if (!schedule) {
        setAvailableTimes([]);
        return;
      }

      // Get all appointments for this barber on this date
      const allAppts = await api.getAppointments();
      const barberApptsOnDate = allAppts.filter(a => a.barber_id === selectedBarber && a.date === selectedDate && a.status !== 'canceled');

      // Generate time slots
      const slots: string[] = [];
      let current = new Date(`2000-01-01T${schedule.start_time}`);
      const end = new Date(`2000-01-01T${schedule.end_time}`);
      
      const service = services.find(s => s.id === selectedService);
      const duration = service ? service.duration : 30; // Default 30 mins

      while (current < end) {
        const timeString = current.toTimeString().substring(0, 5);
        
        // Check if this slot overlaps with any existing appointment
        const isAvailable = !barberApptsOnDate.some(appt => {
          const apptTime = appt.time;
          // Simplified check: if it matches exactly, it's taken. 
          // A real app would check duration overlap.
          return apptTime === timeString;
        });

        if (isAvailable) {
          slots.push(timeString);
        }

        // Increment by 30 minutes
        current.setMinutes(current.getMinutes() + 30);
      }

      setAvailableTimes(slots);
    };

    calculateAvailableTimes();
  }, [selectedBarber, selectedService, selectedDate, schedules, services]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime || !user) {
      toast('Preencha todos os campos', 'error');
      return;
    }

    setIsBooking(true);
    try {
      await api.createAppointment({
        customer_id: user.id,
        barber_id: selectedBarber,
        service_id: selectedService,
        date: selectedDate,
        time: selectedTime,
        status: 'pending'
      });
      
      toast('Agendamento realizado com sucesso!', 'success');
      
      // Reset form
      setSelectedBarber('');
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      
      // Reload data
      loadData();
    } catch (error) {
      toast('Erro ao realizar agendamento', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-orange-500/10 text-orange-500">Pendente</span>;
      case 'confirmed': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">Confirmado</span>;
      case 'completed': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-500">Concluído</span>;
      case 'canceled': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-red-500/10 text-red-500">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-amber-50">Olá, {user?.name}</h1>
        <p className="mt-1 text-sm text-amber-100/50">Bem-vindo(a) à sua área de agendamentos.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Booking Form */}
        <div className="rounded-2xl border border-amber-500/10 bg-[#14100c]/80 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-amber-50 mb-6 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-amber-500" />
            Novo Agendamento
          </h2>
          
          <form onSubmit={handleBook} className="flex flex-col gap-5">
            <div className="space-y-4">
              <Select 
                label="Escolha o Barbeiro" 
                required 
                options={[{label: 'Selecione...', value: ''}, ...barbers.map(b => ({ label: b.name, value: b.id }))]}
                value={selectedBarber}
                onChange={e => { setSelectedBarber(e.target.value); setSelectedTime(''); }}
              />
              
              <Select 
                label="Escolha o Serviço" 
                required 
                options={[{label: 'Selecione...', value: ''}, ...services.map(s => ({ label: `${s.name} - R$ ${s.price.toFixed(2)} (${s.duration} min)`, value: s.id }))]}
                value={selectedService}
                onChange={e => { setSelectedService(e.target.value); setSelectedTime(''); }}
              />
              
              <Input 
                label="Data" 
                type="date"
                required 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              />
            </div>

            {selectedDate && selectedBarber && selectedService && (
              <div className="pt-2 border-t border-amber-500/10">
                <label className="mb-2 block text-xs font-medium text-amber-100/70">Horários Disponíveis</label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 text-xs font-medium rounded-md transition-all border ${
                          selectedTime === time 
                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                            : 'bg-[#0e0b07] text-amber-100/70 border-amber-500/20 hover:border-amber-500/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Nenhum horário disponível para esta data.</p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="mt-4 w-full" 
              isLoading={isBooking}
              disabled={!selectedTime}
            >
              Confirmar Agendamento
            </Button>
          </form>
        </div>

        {/* My Appointments List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-amber-50 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Meus Agendamentos
          </h2>
          
          {isLoading ? (
            <div className="p-8 text-center text-amber-100/50">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-amber-500/10 bg-[#14100c]/80 p-8 text-center shadow-xl backdrop-blur-xl">
              <p className="text-amber-100/50">Você ainda não possui agendamentos.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {appointments.map(appt => {
                const barber = barbers.find(b => b.id === appt.barber_id);
                const service = services.find(s => s.id === appt.service_id);
                const isPast = new Date(`${appt.date}T${appt.time}`) < new Date();
                
                return (
                  <div 
                    key={appt.id} 
                    className={`rounded-xl border border-amber-500/10 bg-[#14100c]/80 p-4 shadow-lg backdrop-blur-xl transition-all ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-amber-50 text-lg">
                          {new Date(appt.date).toLocaleDateString('pt-BR')} às {appt.time}
                        </div>
                        <div className="text-sm text-amber-100/70 flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" /> {barber?.name || 'Barbeiro não encontrado'}
                        </div>
                      </div>
                      {getStatusBadge(appt.status)}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-amber-500/10">
                      <div className="text-sm text-amber-100/70 flex items-center gap-1">
                        <Scissors className="h-3 w-3" /> {service?.name || 'Serviço não encontrado'}
                      </div>
                      <div className="font-medium text-amber-400">
                        R$ {service?.price.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
