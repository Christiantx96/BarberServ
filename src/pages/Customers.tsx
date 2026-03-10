import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Customer } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast('Erro ao carregar clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        status: customer.status,
        notes: customer.notes
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', status: 'active', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
        toast('Cliente atualizado com sucesso', 'success');
      } else {
        await api.createCustomer(formData);
        toast('Cliente criado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error) {
      toast('Erro ao salvar cliente', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.deleteCustomer(id);
      toast('Cliente excluído', 'success');
      loadCustomers();
    } catch (error) {
      toast('Erro ao excluir cliente', 'error');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Clientes</h1>
          <p className="mt-1 text-sm text-amber-100/50">Gerencie seus clientes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-amber-500/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
            <Input 
              placeholder="Buscar cliente..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-amber-100/50">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-amber-500/5">
                    <td className="px-4 py-3 font-medium text-amber-50">{customer.name}</td>
                    <td className="px-4 py-3 text-amber-100/70">{customer.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
                        customer.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(customer)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(customer.id)}>
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
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
          <Select 
            label="Status" 
            options={[
              { label: 'Ativo', value: 'active' },
              { label: 'Inativo', value: 'inactive' }
            ]}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          />
          <Input 
            label="Observações" 
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
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
