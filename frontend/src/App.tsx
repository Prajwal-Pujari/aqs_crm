import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import UnsubscribePage from '@/pages/UnsubscribePage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import DashboardPage from '@/pages/DashboardPage';
import CompaniesPage from '@/pages/CompaniesPage';
import ContactsPage from '@/pages/ContactsPage';
import ContractsPage from '@/pages/ContractsPage';
import PipelinePage from '@/pages/PipelinePage';
import EmailPage from '@/pages/EmailPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="email" element={<EmailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
