import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { PublicLayout } from './components/public/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { Checkout } from './pages/Checkout';
import { PaymentReturn } from './pages/PaymentReturn';
import { TicketPage } from './pages/TicketPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminScan } from './pages/admin/AdminScan';
import { AdminSettings } from './pages/admin/AdminSettings';

function RequireAdmin({ children }: {children: React.ReactNode;}) {
  const { isAdmin } = useApp();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(27,16,48,0.92)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#f6f2ff',
              backdropFilter: 'blur(16px)'
            }
          }} />
        
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/evenements/:eventId" element={<EventDetail />} />
            <Route path="/paiement/:eventId" element={<Checkout />} />
            <Route path="/paiement/:eventId/retour" element={<PaymentReturn />} />
            <Route path="/billet/:code" element={<TicketPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
            <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }>
            
            <Route index element={<AdminDashboard />} />
            <Route path="evenements" element={<AdminEvents />} />
            <Route path="billets" element={<AdminTickets />} />
            <Route path="scan" element={<AdminScan />} />
            <Route path="parametres" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>);

}