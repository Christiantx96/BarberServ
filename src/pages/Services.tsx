import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Service } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    active: 'true'
  });

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await api.getServices();
      setServices(data);
    } catch (error) {
      toast('Erro ao carregar serviços', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        duration: service.duration.toString(),
        price: service.price.toString(),
        active: service.active ? 'true' : 'false'
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', duration: '', price: '', active: 'true' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        duration: Number(formData.duration),
        price: Number(formData.price),
        active: formData.active === 'true'
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
        toast('Serviço atualizado com sucesso', 'success');
      } else {
        await api.createService(payload);
        toast('Serviço criado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadServices();
    } catch (error) {
      toast('Erro ao salvar serviço', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await api.deleteService(id);
      toast('Serviço excluído', 'success');
      loadServices();
    } catch (error) {
      toast('Erro ao excluir serviço', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Serviços</h1>
          <p className="mt-1 text-sm text-amber-100/50">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Duração (min)</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Nenhum serviço encontrado.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="transition-colors hover:bg-amber-500/5">
                    <td className="px-4 py-3 font-medium text-amber-50">{service.name}</td>
                    <td className="px-4 py-3 text-amber-100/70">{service.duration} min</td>
                    <td className="px-4 py-3 text-amber-100/70">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
                        service.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(service)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(service.id)}>
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
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Nome do Serviço" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Duração (minutos)" 
            type="number" 
            min="1"
            required 
            value={formData.duration}
            onChange={e => setFormData({...formData, duration: e.target.value})}
          />
          <Input 
            label="Preço (R$)" 
            type="number" 
            step="0.01"
            min="0"
            required 
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
          <Select 
            label="Status" 
            options={[
              { label: 'Ativo', value: 'true' },
              { label: 'Inativo', value: 'false' }
            ]}
            value={formData.active}
            onChange={e => setFormData({...formData, active: e.target.value})}
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
