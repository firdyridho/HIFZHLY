import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import MurojaahPage from '../pages/MurojaahPage';
import MushafPage from '../pages/MushafPage';
import TajwidPage from '../pages/TajwidPage';
import MutabaahPage from '../pages/MutabaahPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MurojaahPage />} />
        <Route path="mushaf" element={<MushafPage />} />
        <Route path="tajwid" element={<TajwidPage />} />
        <Route path="mutabaah" element={<MutabaahPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
