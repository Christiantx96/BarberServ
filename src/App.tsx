/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShopProvider, useShop } from './contexts/ShopContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Plans } from './pages/Plans';
import { Subscriptions } from './pages/Subscriptions';
import { Payments } from './pages/Payments';
import { Barbers } from './pages/Barbers';
import { Services } from './pages/Services';
import { Products } from './pages/Products';
import { Appointments } from './pages/Appointments';
import { Schedules } from './pages/Schedules';
import { CustomerAppointments } from './pages/CustomerAppointments';
import { Profile } from './pages/Profile';
import { GlobalAdmin } from './pages/GlobalAdmin';
import { RegisterBusiness } from './pages/RegisterBusiness';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('admin' | 'barber' | 'customer')[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#0e0a06] text-amber-500">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access an unauthorized page
    if (user.role === 'customer') {
      return <Navigate to="/cliente/agendamentos" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <Layout>{children}</Layout>;
}

function RootRedirect() {
  const { user, isLoading: authLoading } = useAuth();
  const { currentShop, isLoading: shopLoading } = useShop();
  
  if (authLoading || shopLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#0e0a06] text-amber-500">Carregando...</div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;

  // Special case for Super Admin
  if (user.isPlatformAdmin) {
    if (!currentShop) {
      return <Navigate to="/admin/global" replace />;
    }
  }

  // Regular role-based redirect
  if (user.role === 'customer') {
    return <Navigate to="/cliente/agendamentos" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <SettingsProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<RootRedirect />} />
                
                {/* Customer Routes */}
                <Route path="/cliente/agendamentos" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerAppointments />
                  </ProtectedRoute>
                } />

                {/* Admin/Barber Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Dashboard /></ProtectedRoute>} />
                <Route path="/agendamentos" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Appointments /></ProtectedRoute>} />
                <Route path="/financeiro" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Payments /></ProtectedRoute>} />
                <Route path="/barbeiros" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Barbers /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Customers /></ProtectedRoute>} />
                <Route path="/servicos" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Services /></ProtectedRoute>} />
                <Route path="/produtos" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Products /></ProtectedRoute>} />
                <Route path="/expedientes" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Schedules /></ProtectedRoute>} />
                <Route path="/assinaturas" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Subscriptions /></ProtectedRoute>} />
                <Route path="/planos" element={<ProtectedRoute allowedRoles={['admin', 'barber']}><Plans /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute allowedRoles={['admin', 'barber', 'customer']}><Profile /></ProtectedRoute>} />
                
                {/* Global Admin Route */}
                <Route path="/admin/global" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GlobalAdmin />
                  </ProtectedRoute>
                } />

                {/* Public SaaS Routes */}
                <Route path="/registrar-barbearia" element={<RegisterBusiness />} />
              </Routes>
            </Router>
          </ToastProvider>
        </SettingsProvider>
      </ShopProvider>
    </AuthProvider>
  );
}
