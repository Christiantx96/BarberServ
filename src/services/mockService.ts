import { Customer, Payment, Plan, ServiceInterface, Subscription, Barber, Service, Product, Appointment, Schedule } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial Seed Data
const seedCustomers: Customer[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', status: 'active', notes: 'Cliente frequente', createdAt: new Date().toISOString() },
  { id: 'c2', name: 'Marcos Carvalho', email: 'marcos@email.com', status: 'active', notes: '', createdAt: new Date().toISOString() },
  { id: 'c3', name: 'Pedro Oliveira', email: 'pedro@email.com', status: 'inactive', notes: 'Viajou', createdAt: new Date().toISOString() },
];

const seedPlans: Plan[] = [
  { id: 'p1', name: 'Corte Mensal', price: 60, active: true, createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Corte + Barba', price: 100, active: true, createdAt: new Date().toISOString() },
];

const seedSubscriptions: Subscription[] = [
  { id: 's1', customer_id: 'c1', plan_id: 'p1', start_date: '2026-02-01', next_renewal: '2026-03-01', status: 'expired', createdAt: new Date().toISOString() },
  { id: 's2', customer_id: 'c2', plan_id: 'p2', start_date: '2026-03-01', next_renewal: '2026-04-01', status: 'active', createdAt: new Date().toISOString() },
  { id: 's3', customer_id: 'c3', plan_id: 'p1', start_date: '2025-12-01', next_renewal: '2026-01-01', status: 'canceled', createdAt: new Date().toISOString() },
];

const seedPayments: Payment[] = [
  { id: 'pay1', subscription_id: 's1', amount: 60, paid_at: '2026-02-01', createdAt: new Date().toISOString() },
  { id: 'pay2', subscription_id: 's2', amount: 100, paid_at: '2026-03-01', createdAt: new Date().toISOString() },
];

const seedBarbers: Barber[] = [
  { id: 'b1', name: 'Felipe Esteves', email: 'felipe@barberos.com', phone: '11999999999', status: 'active', createdAt: new Date().toISOString() },
  { id: 'b2', name: 'André Nunes', email: 'andre@barberos.com', phone: '11988888888', status: 'active', createdAt: new Date().toISOString() },
];

const seedServices: Service[] = [
  { id: 'srv1', name: 'Corte Clássico', duration: 30, price: 45, active: true, createdAt: new Date().toISOString() },
  { id: 'srv2', name: 'Barba Completa', duration: 30, price: 35, active: true, createdAt: new Date().toISOString() },
  { id: 'srv3', name: 'Corte + Barba', duration: 60, price: 70, active: true, createdAt: new Date().toISOString() },
];

const seedProducts: Product[] = [
  { id: 'prod1', name: 'Pomada Modeladora', price: 45, stock: 20, active: true, createdAt: new Date().toISOString() },
  { id: 'prod2', name: 'Óleo para Barba', price: 35, stock: 15, active: true, createdAt: new Date().toISOString() },
];

const seedAppointments: Appointment[] = [
  { id: 'app1', customer_id: 'c1', barber_id: 'b1', service_id: 'srv3', date: new Date().toISOString().split('T')[0], time: '09:00', status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 'app2', customer_id: 'c2', barber_id: 'b2', service_id: 'srv1', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'pending', createdAt: new Date().toISOString() },
];

const seedSchedules: Schedule[] = [
  { id: 'sch1', barber_id: 'b1', day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true, createdAt: new Date().toISOString() },
  { id: 'sch2', barber_id: 'b1', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true, createdAt: new Date().toISOString() },
];

// Initialize DB
if (!localStorage.getItem('barber_customers')) {
  setStorage('barber_customers', seedCustomers);
  setStorage('barber_plans', seedPlans);
  setStorage('barber_subscriptions', seedSubscriptions);
  setStorage('barber_payments', seedPayments);
  setStorage('barber_barbers', seedBarbers);
  setStorage('barber_services', seedServices);
  setStorage('barber_products', seedProducts);
  setStorage('barber_appointments', seedAppointments);
  setStorage('barber_schedules', seedSchedules);
}

const checkSubscriptionStatus = (sub: Subscription): Subscription => {
  if (sub.status === 'canceled') return sub;
  const today = new Date().toISOString().split('T')[0];
  if (sub.next_renewal < today && sub.status !== 'expired') {
    return { ...sub, status: 'expired' };
  }
  return sub;
};

export const mockService: ServiceInterface = {
  // Customers
  async getCustomers() {
    await delay(400);
    return getStorage<Customer[]>('barber_customers', []);
  },
  async createCustomer(data) {
    await delay(500);
    const customers = getStorage<Customer[]>('barber_customers', []);
    const newCustomer: Customer = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_customers', [...customers, newCustomer]);
    return newCustomer;
  },
  async updateCustomer(id, data) {
    await delay(500);
    const customers = getStorage<Customer[]>('barber_customers', []);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    customers[index] = { ...customers[index], ...data };
    setStorage('barber_customers', customers);
    return customers[index];
  },
  async deleteCustomer(id) {
    await delay(500);
    const customers = getStorage<Customer[]>('barber_customers', []);
    setStorage('barber_customers', customers.filter(c => c.id !== id));
  },

  // Plans
  async getPlans() {
    await delay(400);
    return getStorage<Plan[]>('barber_plans', []);
  },
  async createPlan(data) {
    await delay(500);
    const plans = getStorage<Plan[]>('barber_plans', []);
    const newPlan: Plan = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_plans', [...plans, newPlan]);
    return newPlan;
  },
  async updatePlan(id, data) {
    await delay(500);
    const plans = getStorage<Plan[]>('barber_plans', []);
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Plan not found');
    plans[index] = { ...plans[index], ...data };
    setStorage('barber_plans', plans);
    return plans[index];
  },
  async deletePlan(id) {
    await delay(500);
    const plans = getStorage<Plan[]>('barber_plans', []);
    setStorage('barber_plans', plans.filter(p => p.id !== id));
  },

  // Subscriptions
  async getSubscriptions() {
    await delay(400);
    const subs = getStorage<Subscription[]>('barber_subscriptions', []);
    // Auto-expire logic
    let changed = false;
    const updatedSubs = subs.map(sub => {
      const checked = checkSubscriptionStatus(sub);
      if (checked.status !== sub.status) changed = true;
      return checked;
    });
    if (changed) setStorage('barber_subscriptions', updatedSubs);
    return updatedSubs;
  },
  async createSubscription(data) {
    await delay(500);
    const subs = getStorage<Subscription[]>('barber_subscriptions', []);
    const newSub: Subscription = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_subscriptions', [...subs, newSub]);
    return newSub;
  },
  async updateSubscription(id, data) {
    await delay(500);
    const subs = getStorage<Subscription[]>('barber_subscriptions', []);
    const index = subs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subscription not found');
    subs[index] = { ...subs[index], ...data };
    setStorage('barber_subscriptions', subs);
    return subs[index];
  },
  async deleteSubscription(id) {
    await delay(500);
    const subs = getStorage<Subscription[]>('barber_subscriptions', []);
    setStorage('barber_subscriptions', subs.filter(s => s.id !== id));
  },

  // Payments
  async getPayments() {
    await delay(400);
    return getStorage<Payment[]>('barber_payments', []);
  },
  async createPayment(data) {
    await delay(500);
    const payments = getStorage<Payment[]>('barber_payments', []);
    const newPayment: Payment = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_payments', [...payments, newPayment]);

    // Update subscription next_renewal and status
    const subs = getStorage<Subscription[]>('barber_subscriptions', []);
    const subIndex = subs.findIndex(s => s.id === data.subscription_id);
    if (subIndex !== -1) {
      const sub = subs[subIndex];
      const currentRenewal = new Date(sub.next_renewal);
      currentRenewal.setDate(currentRenewal.getDate() + 30);
      subs[subIndex] = {
        ...sub,
        status: 'active',
        next_renewal: currentRenewal.toISOString().split('T')[0]
      };
      setStorage('barber_subscriptions', subs);
    }

    return newPayment;
  },
  async listPaymentsBySubscription(subscriptionId) {
    await delay(400);
    const payments = getStorage<Payment[]>('barber_payments', []);
    return payments.filter(p => p.subscription_id === subscriptionId);
  },

  // Barbers
  async getBarbers() {
    await delay(400);
    return getStorage<Barber[]>('barber_barbers', []);
  },
  async createBarber(data) {
    await delay(500);
    const barbers = getStorage<Barber[]>('barber_barbers', []);
    const newBarber: Barber = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_barbers', [...barbers, newBarber]);
    return newBarber;
  },
  async updateBarber(id, data) {
    await delay(500);
    const barbers = getStorage<Barber[]>('barber_barbers', []);
    const index = barbers.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Barber not found');
    barbers[index] = { ...barbers[index], ...data };
    setStorage('barber_barbers', barbers);
    return barbers[index];
  },
  async deleteBarber(id) {
    await delay(500);
    const barbers = getStorage<Barber[]>('barber_barbers', []);
    setStorage('barber_barbers', barbers.filter(b => b.id !== id));
  },

  // Services
  async getServices() {
    await delay(400);
    return getStorage<Service[]>('barber_services', []);
  },
  async createService(data) {
    await delay(500);
    const services = getStorage<Service[]>('barber_services', []);
    const newService: Service = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_services', [...services, newService]);
    return newService;
  },
  async updateService(id, data) {
    await delay(500);
    const services = getStorage<Service[]>('barber_services', []);
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    services[index] = { ...services[index], ...data };
    setStorage('barber_services', services);
    return services[index];
  },
  async deleteService(id) {
    await delay(500);
    const services = getStorage<Service[]>('barber_services', []);
    setStorage('barber_services', services.filter(s => s.id !== id));
  },

  // Products
  async getProducts() {
    await delay(400);
    return getStorage<Product[]>('barber_products', []);
  },
  async createProduct(data) {
    await delay(500);
    const products = getStorage<Product[]>('barber_products', []);
    const newProduct: Product = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_products', [...products, newProduct]);
    return newProduct;
  },
  async updateProduct(id, data) {
    await delay(500);
    const products = getStorage<Product[]>('barber_products', []);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    products[index] = { ...products[index], ...data };
    setStorage('barber_products', products);
    return products[index];
  },
  async deleteProduct(id) {
    await delay(500);
    const products = getStorage<Product[]>('barber_products', []);
    setStorage('barber_products', products.filter(p => p.id !== id));
  },

  // Appointments
  async getAppointments() {
    await delay(400);
    return getStorage<Appointment[]>('barber_appointments', []);
  },
  async createAppointment(data) {
    await delay(500);
    const appointments = getStorage<Appointment[]>('barber_appointments', []);
    const newAppointment: Appointment = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_appointments', [...appointments, newAppointment]);
    return newAppointment;
  },
  async updateAppointment(id, data) {
    await delay(500);
    const appointments = getStorage<Appointment[]>('barber_appointments', []);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    appointments[index] = { ...appointments[index], ...data };
    setStorage('barber_appointments', appointments);
    return appointments[index];
  },
  async deleteAppointment(id) {
    await delay(500);
    const appointments = getStorage<Appointment[]>('barber_appointments', []);
    setStorage('barber_appointments', appointments.filter(a => a.id !== id));
  },

  // Schedules
  async getSchedules() {
    await delay(400);
    return getStorage<Schedule[]>('barber_schedules', []);
  },
  async createSchedule(data) {
    await delay(500);
    const schedules = getStorage<Schedule[]>('barber_schedules', []);
    const newSchedule: Schedule = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setStorage('barber_schedules', [...schedules, newSchedule]);
    return newSchedule;
  },
  async updateSchedule(id, data) {
    await delay(500);
    const schedules = getStorage<Schedule[]>('barber_schedules', []);
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    schedules[index] = { ...schedules[index], ...data };
    setStorage('barber_schedules', schedules);
    return schedules[index];
  },
  async deleteSchedule(id) {
    await delay(500);
    const schedules = getStorage<Schedule[]>('barber_schedules', []);
    setStorage('barber_schedules', schedules.filter(s => s.id !== id));
  }
};

