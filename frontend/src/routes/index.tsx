import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TermsPage from '../pages/TermsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import MurojaahPage from '../pages/MurojaahPage';
import MushafPage from '../pages/MushafPage';
import TajwidPage from '../pages/TajwidPage';
import MutabaahPage from '../pages/MutabaahPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Landing & Auth Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* 2. Admin / Musyrif Portal */}
      <Route path="/admin" element={<AdminDashboardPage />} />

      {/* 3. Murojaah App (Santri Portal with Nested MainLayout) */}
      <Route path="/app" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="murojaah" element={<MurojaahPage />} />
        <Route path="mushaf" element={<MushafPage />} />
        <Route path="tajwid" element={<TajwidPage />} />
        <Route path="mutabaah" element={<MutabaahPage />} />
      </Route>

      {/* 4. Legacy Redirects (agar /murojaah, /mushaf tetap jalan) */}
      <Route path="/murojaah" element={<Navigate to="/app/murojaah" replace />} />
      <Route path="/mushaf" element={<Navigate to="/app/mushaf" replace />} />
      <Route path="/tajwid" element={<Navigate to="/app/tajwid" replace />} />
      <Route path="/mutabaah" element={<Navigate to="/app/mutabaah" replace />} />

      {/* 5. Custom 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
