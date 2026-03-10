import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Barber, Schedule } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    barber_id: '',
    day_of_week: '1',
    start_time: '09:00',
    end_time: '18:00',
    is_active: 'true'
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schData, barbData] = await Promise.all([
        api.getSchedules(),
        api.getBarbers()
      ]);
      setSchedules(schData.sort((a, b) => a.day_of_week - b.day_of_week));
      setBarbers(barbData);
    } catch (error) {
      toast('Erro ao carregar expedientes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        barber_id: schedule.barber_id,
        day_of_week: schedule.day_of_week.toString(),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active ? 'true' : 'false'
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        barber_id: '',
        day_of_week: '1',
        start_time: '09:00',
        end_time: '18:00',
        is_active: 'true'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        barber_id: formData.barber_id,
        day_of_week: Number(formData.day_of_week),
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: formData.is_active === 'true'
      };

      if (editingSchedule) {
        await api.updateSchedule(editingSchedule.id, payload);
        toast('Expediente atualizado com sucesso', 'success');
      } else {
        await api.createSchedule(payload);
        toast('Expediente criado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao salvar expediente', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este expediente?')) return;
    try {
      await api.deleteSchedule(id);
      toast('Expediente excluído', 'success');
      loadData();
    } catch (error) {
      toast('Erro ao excluir expediente', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Expedientes</h1>
          <p className="mt-1 text-sm text-amber-100/50">Configure os horários de trabalho dos barbeiros</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Novo Expediente
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Barbeiro</th>
                <th className="px-4 py-3 font-medium">Dia da Semana</th>
                <th className="px-4 py-3 font-medium">Horário</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Nenhum expediente encontrado.</td>
                </tr>
              ) : (
                schedules.map((schedule) => {
                  const barber = barbers.find(b => b.id === schedule.barber_id);
                  
                  return (
                    <tr key={schedule.id} className="transition-colors hover:bg-amber-500/5">
                      <td className="px-4 py-3 font-medium text-amber-50">{barber?.name || 'Desconhecido'}</td>
                      <td className="px-4 py-3 text-amber-100/70">{DAYS_OF_WEEK[schedule.day_of_week]}</td>
                      <td className="px-4 py-3 text-amber-100/70">{schedule.start_time} às {schedule.end_time}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
                          schedule.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {schedule.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(schedule)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(schedule.id)}>
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
        title={editingSchedule ? 'Editar Expediente' : 'Novo Expediente'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select 
            label="Barbeiro" 
            required 
            options={barbers.map(b => ({ label: b.name, value: b.id }))}
            value={formData.barber_id}
            onChange={e => setFormData({...formData, barber_id: e.target.value})}
          />
          <Select 
            label="Dia da Semana" 
            required 
            options={DAYS_OF_WEEK.map((day, index) => ({ label: day, value: index }))}
            value={formData.day_of_week}
            onChange={e => setFormData({...formData, day_of_week: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Horário Início" 
              type="time"
              required 
              value={formData.start_time}
              onChange={e => setFormData({...formData, start_time: e.target.value})}
            />
            <Input 
              label="Horário Fim" 
              type="time"
              required 
              value={formData.end_time}
              onChange={e => setFormData({...formData, end_time: e.target.value})}
            />
          </div>
          <Select 
            label="Status" 
            options={[
              { label: 'Ativo', value: 'true' },
              { label: 'Inativo', value: 'false' }
            ]}
            value={formData.is_active}
            onChange={e => setFormData({...formData, is_active: e.target.value})}
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
