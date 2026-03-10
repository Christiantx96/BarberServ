import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Appointment, Barber, Customer, Service } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_id: '',
    barber_id: '',
    service_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    status: 'pending' as 'pending' | 'confirmed' | 'canceled' | 'completed' | 'blocked'
  });

  const [blockFormData, setBlockFormData] = useState({
    barber_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [apptsData, custData, barbData, servData] = await Promise.all([
        api.getAppointments(),
        api.getCustomers(),
        api.getBarbers(),
        api.getServices()
      ]);
      setAppointments(apptsData.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()));
      setCustomers(custData);
      setBarbers(barbData);
      setServices(servData);
    } catch (error) {
      toast('Erro ao carregar agendamentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (appt?: Appointment) => {
    if (appt) {
      setEditingAppt(appt);
      setFormData({
        customer_id: appt.customer_id,
        barber_id: appt.barber_id,
        service_id: appt.service_id,
        date: appt.date,
        time: appt.time,
        status: appt.status
      });
    } else {
      setEditingAppt(null);
      setFormData({
        customer_id: '',
        barber_id: '',
        service_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        status: 'pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenBlockModal = () => {
    setBlockFormData({
      barber_id: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
    });
    setIsBlockModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingAppt) {
        await api.updateAppointment(editingAppt.id, formData);
        
        // Automate financial record if status is completed
        if (formData.status === 'completed' && editingAppt.status !== 'completed') {
          const service = services.find(s => s.id === formData.service_id);
          if (service) {
            await api.createPayment({
              appointment_id: editingAppt.id,
              customer_id: formData.customer_id,
              amount: service.price,
              paid_at: new Date().toISOString()
            });
            toast('Pagamento registrado automaticamente!', 'success');
          }
        }
        
        toast('Agendamento atualizado com sucesso', 'success');
      } else {
        const newAppt = await api.createAppointment(formData);
        
        // If creating already as completed (unlikely but possible)
        if (formData.status === 'completed') {
          const service = services.find(s => s.id === formData.service_id);
          if (service) {
            await api.createPayment({
              appointment_id: newAppt.id,
              customer_id: formData.customer_id,
              amount: service.price,
              paid_at: new Date().toISOString()
            });
          }
        }
        
        toast('Agendamento criado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao salvar agendamento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.createAppointment({
        customer_id: 'blocked', // Placeholder
        barber_id: blockFormData.barber_id,
        service_id: 'blocked', // Placeholder
        date: blockFormData.date,
        time: blockFormData.time,
        status: 'blocked'
      });
      toast('Horário bloqueado com sucesso', 'success');
      setIsBlockModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao bloquear horário', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      await api.deleteAppointment(id);
      toast('Agendamento excluído', 'success');
      loadData();
    } catch (error) {
      toast('Erro ao excluir agendamento', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-orange-500/10 text-orange-500">Pendente</span>;
      case 'confirmed': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">Confirmado</span>;
      case 'completed': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-500">Concluído</span>;
      case 'canceled': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-red-500/10 text-red-500">Cancelado</span>;
      case 'blocked': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-zinc-500/10 text-zinc-400">Bloqueado</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Agendamentos</h1>
          <p className="mt-1 text-sm text-amber-100/50">Gerencie a agenda da barbearia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleOpenBlockModal}>
            <ShieldAlert className="h-4 w-4" />
            Bloquear Horário
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Data/Hora</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Barbeiro</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-amber-100/50">Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const customer = customers.find(c => c.id === appt.customer_id);
                  const barber = barbers.find(b => b.id === appt.barber_id);
                  const service = services.find(s => s.id === appt.service_id);
                  
                  const isBlocked = appt.status === 'blocked';
                  
                  return (
                    <tr key={appt.id} className={`transition-colors hover:bg-amber-500/5 ${isBlocked ? 'bg-zinc-900/30' : ''}`}>
                      <td className="px-4 py-3 text-amber-100/70">
                        <div className="font-medium text-amber-50">{new Date(appt.date).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs">{appt.time}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-amber-50">
                        {isBlocked ? <span className="text-zinc-500 italic">Horário Bloqueado</span> : (customer?.name || 'Desconhecido')}
                      </td>
                      <td className="px-4 py-3 text-amber-100/70">{barber?.name || 'Desconhecido'}</td>
                      <td className="px-4 py-3 text-amber-100/70">
                        {isBlocked ? '-' : (service?.name || 'Desconhecido')}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(appt.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isBlocked && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(appt)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(appt.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAppt ? 'Editar Agendamento' : 'Novo Agendamento'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select 
            label="Cliente" 
            required 
            options={customers.map(c => ({ label: c.name, value: c.id }))}
            value={formData.customer_id}
            onChange={e => setFormData({...formData, customer_id: e.target.value})}
          />
          <Select 
            label="Barbeiro" 
            required 
            options={barbers.map(b => ({ label: b.name, value: b.id }))}
            value={formData.barber_id}
            onChange={e => setFormData({...formData, barber_id: e.target.value})}
          />
          <Select 
            label="Serviço" 
            required 
            options={services.map(s => ({ label: `${s.name} - R$ ${s.price}`, value: s.id }))}
            value={formData.service_id}
            onChange={e => setFormData({...formData, service_id: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Data" 
              type="date"
              required 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
            <Input 
              label="Hora" 
              type="time"
              required 
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>
          <Select 
            label="Status" 
            options={[
              { label: 'Pendente', value: 'pending' },
              { label: 'Confirmado', value: 'confirmed' },
              { label: 'Concluído', value: 'completed' },
              { label: 'Cancelado', value: 'canceled' }
            ]}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isBlockModalOpen} 
        onClose={() => setIsBlockModalOpen(false)} 
        title="Bloquear Horário"
      >
        <form onSubmit={handleBlockSubmit} className="flex flex-col gap-4">
          <Select 
            label="Barbeiro" 
            required 
            options={barbers.map(b => ({ label: b.name, value: b.id }))}
            value={blockFormData.barber_id}
            onChange={e => setBlockFormData({...blockFormData, barber_id: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Data" 
              type="date"
              required 
              value={blockFormData.date}
              onChange={e => setBlockFormData({...blockFormData, date: e.target.value})}
            />
            <Input 
              label="Hora" 
              type="time"
              required 
              value={blockFormData.time}
              onChange={e => setBlockFormData({...blockFormData, time: e.target.value})}
            />
          </div>
          <p className="text-xs text-amber-100/50 mt-2">
            Este horário ficará indisponível para agendamentos de clientes.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsBlockModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Bloquear Horário</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
