import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Scissors } from 'lucide-react';

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (user) {
      if (user.role === 'customer') {
        navigate('/cliente/agendamentos');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      if (isRegistering) {
        await register(name, email, password, phone);
        // Supabase auto logins on registration if email confirmation is disabled.
        // If email confirmation is required, you might need to show a success message instead.
        navigate('/cliente/agendamentos');
      } else {
        await login(email, password, role);
        // Redirect is handled by the useEffect watching the `user` state
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0a06] p-4 text-[#f0e8d8] font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-amber-500/10 bg-[#14100c]/80 p-8 shadow-2xl backdrop-blur-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20">
            <Scissors className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-50">{settings?.barbershop_name || 'BarberServ'}</h1>
          <p className="mt-2 text-sm text-amber-100/50">
            {isRegistering ? 'Crie sua conta para agendar' : 'Entre para acessar o sistema'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg">
              {errorMsg}
            </div>
          )}

          {!isRegistering && (
            <div className="flex w-full gap-2 p-1 bg-[#0e0b07] rounded-lg border border-amber-500/10 mb-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                  role === 'customer' 
                    ? 'bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/20' 
                    : 'text-amber-100/50 hover:text-amber-100'
                }`}
              >
                Sou Cliente
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                  role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/20' 
                    : 'text-amber-100/50 hover:text-amber-100'
                }`}
              >
                Sou Barbeiro
              </button>
            </div>
          )}

          {isRegistering && (
            <>
              <Input
                label="Nome Completo"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          )}
          
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" className="mt-2 w-full" isLoading={isLoading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
            }}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            {isRegistering ? 'Já tenho uma conta. Fazer login.' : 'Não tem conta? Cadastre-se como cliente.'}
          </button>
        </div>
      </div>
    </div>
  );
}
