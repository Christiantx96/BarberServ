import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend the Supabase User to include our custom meta attributes internally
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barber' | 'customer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'admin' | 'barber' | 'customer') => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
        } else if (session?.user) {
          const userMeta = session.user.user_metadata;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMeta?.name || session.user.email?.split('@')[0] || 'Usuário',
            // Defaulting to customer if no role is defined in metadata
            role: userMeta?.role || 'customer'
          });
        }
      } catch (err) {
        console.error("Unexpected error getting session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen to changes in the auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const userMeta = session.user.user_metadata;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMeta?.name || session.user.email?.split('@')[0] || 'Usuário',
            role: userMeta?.role || 'customer'
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'barber' | 'customer' = 'customer') => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Check if the user trying to login respects the selected role toggle
    if (session?.user) {
      const userMeta = session.user.user_metadata;
      const userRole = userMeta?.role || 'customer';
      
      // If a customer tries to login as admin/barber, we reject it
      if (role !== 'customer' && userRole === 'customer') {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Usuário sem permissões de barbeiro/admin.');
      }
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: 'customer' // By default, registrations here are mapped to customers
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
