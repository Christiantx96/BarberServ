import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Customer, Plan, Subscription } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSubForPayment, setSelectedSubForPayment] = useState<Subscription | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    next_renewal: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    status: 'active' as 'active' | 'expired' | 'canceled'
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [subsData, custData, plansData] = await Promise.all([
        api.getSubscriptions(),
        api.getCustomers(),
        api.getPlans()
      ]);
      setSubscriptions(subsData);
      setCustomers(custData);
      setPlans(plansData);
    } catch (error) {
      toast('Erro ao carregar dados', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sub?: Subscription) => {
    if (sub) {
      setEditingSub(sub);
      setFormData({
        customer_id: sub.customer_id,
        plan_id: sub.plan_id,
        start_date: sub.start_date,
        next_renewal: sub.next_renewal,
        status: sub.status
      });
    } else {
      setEditingSub(null);
      setFormData({
        customer_id: '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        next_renewal: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingSub) {
        await api.updateSubscription(editingSub.id, formData);
        toast('Assinatura atualizada com sucesso', 'success');
      } else {
        await api.createSubscription(formData);
        toast('Assinatura criada com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao salvar assinatura', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta assinatura?')) return;
    try {
      await api.deleteSubscription(id);
      toast('Assinatura excluída', 'success');
      loadData();
    } catch (error) {
      toast('Erro ao excluir assinatura', 'error');
    }
  };

  const handleOpenPaymentModal = (sub: Subscription) => {
    setSelectedSubForPayment(sub);
    const plan = plans.find(p => p.id === sub.plan_id);
    setPaymentAmount(plan ? plan.price.toString() : '');
    setIsPaymentModalOpen(true);
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForPayment) return;
    setIsSaving(true);
    try {
      await api.createPayment({
        subscription_id: selectedSubForPayment.id,
        amount: Number(paymentAmount),
        paid_at: new Date().toISOString().split('T')[0]
      });
      toast('Pagamento registrado e assinatura renovada!', 'success');
      setIsPaymentModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao registrar pagamento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">Ativa</span>;
      case 'expired': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-red-500/10 text-red-500">Vencida</span>;
      case 'canceled': return <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-amber-500/10 text-amber-500">Cancelada</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Assinaturas</h1>
          <p className="mt-1 text-sm text-amber-100/50">Gerencie as assinaturas dos clientes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Próx. Renovação</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-100/50">Nenhuma assinatura encontrada.</td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const customer = customers.find(c => c.id === sub.customer_id);
                  const plan = plans.find(p => p.id === sub.plan_id);
                  
                  return (
                    <tr key={sub.id} className="transition-colors hover:bg-amber-500/5">
                      <td className="px-4 py-3 font-medium text-amber-50">{customer?.name || 'Desconhecido'}</td>
                      <td className="px-4 py-3 text-amber-100/70">{plan?.name || 'Desconhecido'}</td>
                      <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                      <td className="px-4 py-3 text-amber-100/70">
                        {new Date(sub.next_renewal).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 px-2 text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                            onClick={() => handleOpenPaymentModal(sub)}
                            title="Registrar Pagamento"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenModal(sub)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(sub.id)}>
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

      {/* Modal Assinatura */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSub ? 'Editar Assinatura' : 'Nova Assinatura'}
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
            label="Plano" 
            required 
            options={plans.map(p => ({ label: `${p.name} - R$ ${p.price}`, value: p.id }))}
            value={formData.plan_id}
            onChange={e => setFormData({...formData, plan_id: e.target.value})}
          />
          <Input 
            label="Data de Início" 
            type="date"
            required 
            value={formData.start_date}
            onChange={e => setFormData({...formData, start_date: e.target.value})}
          />
          <Input 
            label="Próxima Renovação" 
            type="date"
            required 
            value={formData.next_renewal}
            onChange={e => setFormData({...formData, next_renewal: e.target.value})}
          />
          <Select 
            label="Status" 
            options={[
              { label: 'Ativa', value: 'active' },
              { label: 'Vencida', value: 'expired' },
              { label: 'Cancelada', value: 'canceled' }
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

      {/* Modal Pagamento */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Registrar Pagamento"
      >
        <form onSubmit={handleRegisterPayment} className="flex flex-col gap-4">
          <p className="text-sm text-amber-100/70 mb-2">
            Ao registrar este pagamento, a assinatura será renovada automaticamente por +30 dias.
          </p>
          <Input 
            label="Valor Pago (R$)" 
            type="number" 
            step="0.01"
            min="0"
            required 
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
