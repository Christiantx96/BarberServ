import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, Lock, Mail, User, Scissors } from 'lucide-react';
import { api } from '../services';

export function Profile() {
  const { user } = useAuth();
  const { refreshSettings } = useSettings();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Configurações da Barbearia (Apenas Admin)
  const [shopSettings, setShopSettings] = useState<any>(null);
  
  React.useEffect(() => {
    if (user?.role === 'admin') {
      api.getSettings().then(setShopSettings).catch(console.error);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Atualizar Metadados (Nome)
      if (name !== user?.name) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: { name: name }
        });
        if (metaError) throw metaError;
      }

      // 2. Atualizar E-mail
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });
        if (emailError) throw emailError;
        setMessage({ text: 'E-mail atualizado com sucesso.', type: 'success' });
      }

      // 3. Atualizar Senha
      if (password) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password
        });
        if (passError) throw passError;
        setMessage({ text: 'Senha atualizada com sucesso!', type: 'success' });
        setPassword('');
      }

      // 4. Atualizar Dados da Barbearia (Admin apenas)
      if (user?.role === 'admin' && shopSettings) {
        await api.updateSettings(shopSettings);
        await refreshSettings();
      }

      if (!message.text) {
          setMessage({ text: 'Perfil e configurações atualizados!', type: 'success' });
      }
      
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || 'Erro ao atualizar.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl bg-[#0e0b07] border border-amber-500/10 rounded-2xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-amber-50 flex items-center gap-2">
          <User className="h-6 w-6 text-amber-500" />
          Meu Perfil
        </h1>
        <p className="text-sm text-amber-100/50 mt-1">Atualize seu e-mail, nome e senha de acesso.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm border ${
          message.type === 'error' 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-amber-100/90 border-b border-amber-500/10 pb-2">Dados Pessoais</h2>
          <Input
            label="Nome Completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-medium text-amber-100/90 border-b border-amber-500/10 pb-2 flex items-center gap-2">
             <Mail className="h-4 w-4 text-amber-500/50" /> E-mail de Acesso
          </h2>
          <Input
            label="Novo E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-medium text-amber-100/90 border-b border-amber-500/10 pb-2 flex items-center gap-2">
             <Lock className="h-4 w-4 text-amber-500/50" /> Trocar Senha
          </h2>
          <Input
            label="Nova Senha"
            type="password"
            placeholder="Deixe em branco para manter a atual"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {user?.role === 'admin' && shopSettings && (
          <div className="space-y-6 pt-8 border-t border-amber-500/10">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-amber-50">Informações da Barbearia</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Estabelecimento"
                value={shopSettings.barbershop_name}
                onChange={(e) => setShopSettings({...shopSettings, barbershop_name: e.target.value})}
              />
              <Input
                label="Telefone de Contato"
                value={shopSettings.phone || ''}
                onChange={(e) => setShopSettings({...shopSettings, phone: e.target.value})}
              />
              <Input
                label="URL do Instagram"
                placeholder="@suabarbearia"
                value={shopSettings.instagram || ''}
                onChange={(e) => setShopSettings({...shopSettings, instagram: e.target.value})}
              />
              <Input
                label="Horário de Funcionamento"
                placeholder="Ex: Seg a Sáb, 09h às 19h"
                value={shopSettings.opening_hours || ''}
                onChange={(e) => setShopSettings({...shopSettings, opening_hours: e.target.value})}
              />
            </div>
            <Input
              label="Endereço Completo"
              value={shopSettings.address || ''}
              onChange={(e) => setShopSettings({...shopSettings, address: e.target.value})}
            />
          </div>
        )}

        <div className="pt-6">
          <Button type="submit" className="w-full md:w-auto" isLoading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

      </form>
    </div>
  );
}
