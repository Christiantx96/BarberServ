import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Customer, Payment, Plan, Subscription } from '../services/types';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Plus } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [payData, subsData, custData, plansData, servData] = await Promise.all([
        api.getPayments(),
        api.getSubscriptions(),
        api.getCustomers(),
        api.getPlans(),
        api.getServices()
      ]);
      // Sort payments by date desc
      setPayments(payData.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()));
      setSubscriptions(subsData);
      setCustomers(custData);
      setPlans(plansData);
      setServices(servData);
    } catch (error) {
      toast('Erro ao carregar pagamentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubChange = (subId: string) => {
    setSelectedSubId(subId);
    const sub = subscriptions.find(s => s.id === subId);
    if (sub) {
      const plan = plans.find(p => p.id === sub.plan_id);
      if (plan) setPaymentAmount(plan.price.toString());
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.createPayment({
        subscription_id: selectedSubId,
        amount: Number(paymentAmount),
        paid_at: paymentDate
      });
      toast('Pagamento registrado com sucesso!', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast('Erro ao registrar pagamento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const subOptions = subscriptions.map(sub => {
    const customer = customers.find(c => c.id === sub.customer_id);
    const plan = plans.find(p => p.id === sub.plan_id);
    return {
      label: `${customer?.name || 'Desconhecido'} - ${plan?.name || 'Plano'}`,
      value: sub.id
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">Financeiro</h1>
          <p className="mt-1 text-sm text-amber-100/50">Histórico de pagamentos</p>
        </div>
        <Button onClick={() => {
          setSelectedSubId('');
          setPaymentAmount('');
          setPaymentDate(new Date().toISOString().split('T')[0]);
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          Registrar Pagamento
        </Button>
      </div>

      <div className="rounded-xl border border-amber-500/10 bg-[#14100c]/80 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-amber-500/10 text-xs uppercase text-amber-100/50">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tipo / Referência</th>
                <th className="px-4 py-3 font-medium text-right">Valor Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-amber-100/50">Carregando...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-amber-100/50">Nenhum pagamento encontrado.</td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const sub = subscriptions.find(s => s.id === payment.subscription_id);
                  const customer = customers.find(c => c.id === (payment.customer_id || sub?.customer_id));
                  const plan = plans.find(p => p.id === sub?.plan_id);
                  
                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-amber-500/5">
                      <td className="px-4 py-3 text-amber-100/70">
                        {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-amber-50">{customer?.name || 'Desconhecido'}</td>
                      <td className="px-4 py-3 text-amber-100/70">
                        {payment.appointment_id ? (
                          <span className="flex items-center gap-1">
                             <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                             Serviço Realizado
                          </span>
                        ) : (
                          <span>Assinatura - {plan?.name || 'Plano'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
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
        title="Registrar Pagamento"
      >
        <form onSubmit={handleRegisterPayment} className="flex flex-col gap-4">
          <Select 
            label="Assinatura" 
            required 
            options={subOptions}
            value={selectedSubId}
            onChange={e => handleSubChange(e.target.value)}
          />
          <Input 
            label="Valor Pago (R$)" 
            type="number" 
            step="0.01"
            min="0"
            required 
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
          />
          <Input 
            label="Data do Pagamento" 
            type="date"
            required 
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
