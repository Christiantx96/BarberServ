import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Shop } from '../services/types';
import { Button } from '../components/ui/Button';
import { Plus, Building2, Users, CreditCard, ChevronRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function GlobalAdmin() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', slug: '' });
  const { showToast } = useToast();

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const data = await supabaseService.getShops();
      setShops(data);
    } catch (error) {
      console.error('Error fetching shops:', error);
      showToast('Erro ao carregar barbearias', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabaseService.createShop(newShop);
      showToast('Barbearia criada com sucesso!', 'success');
      setIsCreating(false);
      setNewShop({ name: '', slug: '' });
      fetchShops();
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar barbearia', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Gestão Global SaaS</h1>
          <p className="text-amber-100/60 text-sm">Gerencie todas as barbearias na plataforma</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Barbearia
        </Button>
      </div>

      {isCreating && (
        <div className="bg-[#1a1612] border border-amber-500/20 rounded-xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold text-amber-100 mb-4">Cadastrar Nova Unidade</h2>
          <form onSubmit={handleCreateShop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-amber-100/60 uppercase">Nome da Barbearia</label>
              <input 
                type="text" 
                value={newShop.name}
                onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                className="w-full bg-[#120e0a] border border-amber-500/20 rounded-lg px-4 py-2 text-amber-50 focus:border-amber-500 focus:outline-none"
                placeholder="Ex: Barber Shop Central"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-amber-100/60 uppercase">Slug (identificador na URL)</label>
              <input 
                type="text" 
                value={newShop.slug}
                onChange={(e) => setNewShop({ ...newShop, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full bg-[#120e0a] border border-amber-500/20 rounded-lg px-4 py-2 text-amber-50 focus:border-amber-500 focus:outline-none"
                placeholder="ex: barber-shop-central"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button type="submit">Finalizar Cadastro</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-[#1a1612] border border-amber-500/10 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  shop.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {shop.subscription_status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-amber-50">{shop.name}</h3>
              <p className="text-xs text-amber-100/40 mb-4">slug: {shop.slug}</p>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-500/5">
                <div className="flex items-center gap-2 text-xs text-amber-100/60">
                  <Users className="h-3 w-3" />
                  <span>Gerenciar Equipe</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-100/60">
                  <CreditCard className="h-3 w-3" />
                  <span>Financeiro</span>
                </div>
              </div>
              
              <button className="w-full mt-5 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-amber-100 hover:bg-white/10 transition-colors text-xs font-medium">
                Ver Detalhes
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
