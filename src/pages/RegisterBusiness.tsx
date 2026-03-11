import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Scissors, Building2, Store, User, Mail, Lock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

export function RegisterBusiness() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    shopName: '',
    shopSlug: '',
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, shopSlug: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create the Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.ownerName,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário.');

      // 2. Create the Shop
      // Note: We need to use a special service call or bypass RLS if the user isn't logged in yet
      // But usually, Supabase auto-logs in after signUp.
      // Wait for session to be established or use a service role if available (not here).
      
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .insert([{ 
          name: formData.shopName, 
          slug: formData.shopSlug,
          subscription_status: 'trial'
        }])
        .select()
        .single();

      if (shopError) throw shopError;

      // 3. Create Membership (Owner)
      const { error: memError } = await supabase
        .from('memberships')
        .insert([{
          user_id: authData.user.id,
          shop_id: shop.id,
          role: 'owner'
        }]);

      if (memError) throw memError;

      // 4. Create default settings
      await supabase
        .from('settings')
        .insert([{
          shop_id: shop.id,
          barbershop_name: formData.shopName
        }]);

      showToast('Parabéns! Sua barbearia foi cadastrada com sucesso.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erro ao cadastrar negócio.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0a06] p-4 text-[#f0e8d8] font-sans">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-500/10 bg-[#14100c]/80 p-8 shadow-2xl backdrop-blur-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-50">Registre sua Barbearia</h1>
          <p className="mt-2 text-sm text-amber-100/50">
            Comece a gerenciar seu negócio hoje mesmo e escale sua barbearia com o BarberServ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">Dados do Dono</h2>
            <Input
              label="Nome Completo"
              icon={<User size={16} />}
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <Input
              label="E-mail Profissional"
              type="email"
              icon={<Mail size={16} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Senha de Acesso"
              type="password"
              icon={<Lock size={16} />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">Dados do Negócio</h2>
            <Input
              label="Nome da Barbearia"
              icon={<Store size={16} />}
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              required
            />
            <Input
              label="Endereço na Web (URL)"
              placeholder="ex-barbearia-central"
              value={formData.shopSlug}
              onChange={handleSlugChange}
              helperText="Sua barbearia será acessível por esta URL"
              required
            />
            <div className="pt-6">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500" isLoading={isLoading}>
                Criar Minha Barbearia
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-amber-500/5 pt-6">
          <p className="text-xs text-amber-100/30">
            Já tem uma barbearia? <Link to="/login" className="text-amber-400 hover:underline">Faça login aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
