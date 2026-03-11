export interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: string;
  shop_id: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  createdAt: string;
}

export interface Membership {
  id: string;
  user_id: string;
  shop_id: string;
  role: 'owner' | 'admin' | 'staff';
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
  shop_id: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  start_date: string;
  next_renewal: string;
  status: 'active' | 'expired' | 'canceled';
  createdAt: string;
  shop_id: string;
}

export interface Payment {
  id: string;
  subscription_id?: string;
  appointment_id?: string;
  customer_id?: string;
  amount: number;
  paid_at: string;
  createdAt: string;
  shop_id: string;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  shop_id: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  active: boolean;
  createdAt: string;
  shop_id: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  shop_id: string;
}

export interface Appointment {
  id: string;
  customer_id: string; // Can be empty if blocked
  barber_id: string;
  service_id: string; // Can be empty if blocked
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'blocked';
  createdAt: string;
  shop_id: string;
}

export interface Schedule {
  id: string;
  barber_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_active: boolean;
  createdAt: string;
  shop_id: string;
}

export interface Review {
  id: string;
  appointment_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ServiceInterface {
  // Customers
  getCustomers(): Promise<Customer[]>;
  createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Plans
  getPlans(): Promise<Plan[]>;
  createPlan(data: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan>;
  updatePlan(id: string, data: Partial<Plan>): Promise<Plan>;
  deletePlan(id: string): Promise<void>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  createSubscription(data: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  deleteSubscription(id: string): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  listPaymentsBySubscription(subscriptionId: string): Promise<Payment[]>;

  // Barbers
  getBarbers(): Promise<Barber[]>;
  createBarber(data: Omit<Barber, 'id' | 'createdAt'>): Promise<Barber>;
  updateBarber(id: string, data: Partial<Barber>): Promise<Barber>;
  deleteBarber(id: string): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  createService(data: Omit<Service, 'id' | 'createdAt'>): Promise<Service>;
  updateService(id: string, data: Partial<Service>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Schedules
  getSchedules(): Promise<Schedule[]>;
  createSchedule(data: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule>;
  updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule>;
  deleteSchedule(id: string): Promise<void>;

  // Reviews
  getReviews(): Promise<Review[]>;

  // Settings
  getSettings(): Promise<BarbershopSettings>;
  updateSettings(data: Partial<BarbershopSettings>): Promise<BarbershopSettings>;

  // SaaS / Multi-tenant
  getShops(): Promise<Shop[]>;
  getCurrentShop(): Promise<Shop | null>;
  createShop(data: { name: string, slug: string }): Promise<Shop>;
}

export interface BarbershopSettings {
  id: string;
  barbershop_name: string;
  address: string;
  phone: string;
  instagram: string;
  opening_hours: string;
  primary_color: string;
  logo_url: string;
  updated_at: string;
}
