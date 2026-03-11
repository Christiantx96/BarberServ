import { supabase } from '../lib/supabase';
import { 
  ServiceInterface, 
  Customer, Plan, Subscription, Payment, Barber, 
  Service, Product, Appointment, Schedule 
} from './types';

export const supabaseService: ServiceInterface = {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('customers').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const { data: result, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },

  // Plans
  async getPlans(): Promise<Plan[]> {
    const { data, error } = await supabase.from('plans').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createPlan(data: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('plans').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const { data: result, error } = await supabase.from('plans').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deletePlan(id: string): Promise<void> {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) throw error;
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createSubscription(data: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('subscriptions').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const { data: result, error } = await supabase.from('subscriptions').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteSubscription(id: string): Promise<void> {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('payments').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async listPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*').eq('subscription_id', subscriptionId);
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    const { data, error } = await supabase.from('barbers').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createBarber(data: Omit<Barber, 'id' | 'createdAt'>): Promise<Barber> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('barbers').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateBarber(id: string, data: Partial<Barber>): Promise<Barber> {
    const { data: result, error } = await supabase.from('barbers').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteBarber(id: string): Promise<void> {
    const { error } = await supabase.from('barbers').delete().eq('id', id);
    if (error) throw error;
  },

  // Services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createService(data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('services').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const { data: result, error } = await supabase.from('services').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('products').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const { data: result, error } = await supabase.from('products').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('appointments').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const { data: result, error } = await supabase.from('appointments').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },

  // Schedules
  async getSchedules(): Promise<Schedule[]> {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },
  async createSchedule(data: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule> {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('schedules').insert([{ ...data, shop_id: data.shop_id || shopId }]).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const { data: result, error } = await supabase.from('schedules').update(data).eq('id', id).select().single();
    if (error) throw error;
    return { ...result, createdAt: result.created_at };
  },
  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
  },

  async getReviews() {
    const { data, error } = await supabase.from('reviews').select('*');
    if (error) throw error;
    return data;
  },

  async getSettings() {
    const shopId = localStorage.getItem('currentShopId');
    const { data, error } = await supabase.from('settings').select('*').eq('shop_id', shopId).single();
    if (error) throw error;
    return data;
  },

  async updateSettings(data: any) {
    const shopId = localStorage.getItem('currentShopId');
    const { data: result, error } = await supabase.from('settings').update(data).match({ shop_id: shopId }).select().single();
    if (error) throw error;
    return result;
  },

  // SaaS / Multi-tenant
  async getShops(): Promise<any[]> {
    const { data, error } = await supabase.from('shops').select('*');
    if (error) throw error;
    return data.map(d => ({...d, createdAt: d.created_at}));
  },

  async getCurrentShop(): Promise<any | null> {
    const shopId = localStorage.getItem('currentShopId');
    if (!shopId) return null;
    const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).single();
    if (error) return null;
    return { ...data, createdAt: data.created_at };
  },

  async createShop(data: { name: string, slug: string }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: shop, error: shopError } = await supabase.from('shops').insert([data]).select().single();
    if (shopError) throw shopError;

    // Link user to shop as owner
    const { error: memError } = await supabase.from('memberships').insert([{
      user_id: user.id,
      shop_id: shop.id,
      role: 'owner'
    }]);
    if (memError) throw memError;

    return { ...shop, createdAt: shop.created_at };
  }
};
