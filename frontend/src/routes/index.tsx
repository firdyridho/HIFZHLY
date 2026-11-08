import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TermsPage from '../pages/TermsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import MurojaahPage from '../pages/MurojaahPage';
import HafalanPage from '../pages/HafalanPage';
import MushafPage from '../pages/MushafPage';
import TajwidPage from '../pages/TajwidPage';
import MutabaahPage from '../pages/MutabaahPage';
import TargetPage from '../pages/TargetPage';
import SettingsPage from '../pages/SettingsPage';
import QuizPage from '../pages/QuizPage';
import DoaPage from '../pages/DoaPage';
import DownloadPage from '../pages/DownloadPage';
import AlarmPage from '../pages/AlarmPage';
import NotificationsPage from '../pages/NotificationsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { isNativePlatform } from '../lib/capacitorBridge';

export default function AppRoutes() {
  const isMobileApp = isNativePlatform();
  const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');

  return (
    <Routes>
      {/* 1. Public Landing & Auth Pages (Pada Mobile App langsung dialihkan ke Login atau Dashboard) */}
      <Route
        path="/"
        element={
          isMobileApp ? (
            <Navigate to={token ? '/app' : '/login'} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/download"
        element={
          isMobileApp ? (
            <Navigate to={token ? '/app' : '/login'} replace />
          ) : (
            <DownloadPage />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* 2. Admin / Musyrif Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 3. Murojaah & Santri App (Protected) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute allowedRole="user">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="murojaah" element={<MurojaahPage />} />
        <Route path="hafalan" element={<HafalanPage />} />
        <Route path="mushaf" element={<MushafPage />} />
        <Route path="tajwid" element={<TajwidPage />} />
        <Route path="mutabaah" element={<MutabaahPage />} />
        <Route path="target" element={<TargetPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="doa" element={<DoaPage />} />
        <Route path="alarm" element={<AlarmPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* 4. Legacy Redirects */}
      <Route path="/alarm" element={<Navigate to="/app/alarm" replace />} />
      <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
      <Route path="/target" element={<Navigate to="/app/target" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/quiz" element={<Navigate to="/app/quiz" replace />} />
      <Route path="/doa" element={<Navigate to="/app/doa" replace />} />
      <Route path="/murojaah" element={<Navigate to="/app/murojaah" replace />} />
      <Route path="/hafalan" element={<Navigate to="/app/hafalan" replace />} />
      <Route path="/mushaf" element={<Navigate to="/app/mushaf" replace />} />
      <Route path="/tajwid" element={<Navigate to="/app/tajwid" replace />} />
      <Route path="/mutabaah" element={<Navigate to="/app/mutabaah" replace />} />

      {/* 5. Custom 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
