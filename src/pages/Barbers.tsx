import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Barber } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function Barbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const loadBarbers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBarbers();
      setBarbers(data);
    } catch (error) {
      toast('Erro ao carregar barbeiros', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleOpenModal = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber);
      setFormData({
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        status: barber.status
      });
    } else {
      setEditingBarber(null);
      setFormData({ name: '', email: '', phone: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBarber) {
        await api.updateBarber(editingBarber.id, formData);
        toast('Barbeiro atualizado com sucesso', 'success');
      } else {
        await api.createBarber(formData);
        toast('Barbeiro criado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadBarbers();
    } catch (error) {
      toast('Erro ao salvar barbeiro', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    try {
      await api.deleteBarber(id);
      toast('Barbeiro excluído', 'success');
      loadBarbers();
    } catch (error) {
      toast('Erro ao excluir barbeiro', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Barbeiros</h1>
          <p className="mt-1 text-sm text-amber-100/50">Gerencie a equipe de barbeiros</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Novo Barbeiro
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : barbers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Nenhum barbeiro encontrado.</td>
                </tr>
              ) : (
                barbers.map((barber) => (
                  <tr key={barber.id} className="transition-colors hover:bg-amber-500/5">
                    <td className="px-4 py-3 font-medium text-amber-50">{barber.name}</td>
                    <td className="px-4 py-3 text-amber-100/70">{barber.email}</td>
                    <td className="px-4 py-3 text-amber-100/70">{barber.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
                        barber.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {barber.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(barber)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(barber.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Nome" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="E-mail" 
            type="email" 
            required 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Telefone" 
            required 
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <Select 
            label="Status" 
            options={[
              { label: 'Ativo', value: 'active' },
              { label: 'Inativo', value: 'inactive' }
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
    </div>
  );
}
