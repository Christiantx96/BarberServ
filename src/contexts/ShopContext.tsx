import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Shop } from '../services/types';
import { useAuth } from './AuthContext';

interface ShopContextType {
  shops: Shop[];
  currentShop: Shop | null;
  selectShop: (shopId: string) => void;
  isLoading: boolean;
  refreshShops: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshShops = async () => {
    try {
      if (!user) {
        setShops([]);
        setCurrentShop(null);
        return;
      }

      setIsLoading(true);
      const fetchedShops = await supabaseService.getShops();
      setShops(fetchedShops);

      const savedShopId = localStorage.getItem('currentShopId');
      if (savedShopId) {
        const found = fetchedShops.find(s => s.id === savedShopId);
        if (found) {
          setCurrentShop(found);
        } else if (fetchedShops.length > 0 && !user.isPlatformAdmin) {
          setCurrentShop(fetchedShops[0]);
          localStorage.setItem('currentShopId', fetchedShops[0].id);
        }
      } else if (fetchedShops.length > 0 && !user.isPlatformAdmin) {
        setCurrentShop(fetchedShops[0]);
        localStorage.setItem('currentShopId', fetchedShops[0].id);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshShops();
  }, [user]);

  const selectShop = (shopId: string) => {
    const found = shops.find(s => s.id === shopId);
    if (found) {
      setCurrentShop(found);
      localStorage.setItem('currentShopId', shopId);
      // Optional: reload or trigger global refetch if needed
      window.location.reload(); // Simplest way to ensure all services re-read shopId from localStorage
    }
  };

  return (
    <ShopContext.Provider value={{ shops, currentShop, selectShop, isLoading, refreshShops }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
