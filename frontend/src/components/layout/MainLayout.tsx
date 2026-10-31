import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Mic,
  Award,
  BarChart3,
  Home,
  LogOut,
  Flame,
  Target,
  UserCheck,
} from 'lucide-react';
import type { UserProfile } from '../../types';

export default function MainLayout() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // 1. Load cached profile from localStorage
    const cached = localStorage.getItem('hifzhly_user_profile');
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached profile:', e);
      }
    }

    // 2. Refresh profile from backend if token is available
    const token = localStorage.getItem('hifzhly_auth_token');
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized or session expired');
        })
        .then((data: UserProfile) => {
          setProfile(data);
          localStorage.setItem('hifzhly_user_profile', JSON.stringify(data));
        })
        .catch(() => {
          // If offline or network error, keep using cached profile
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    window.location.href = '/login';
  };

  const displayName = profile?.fullName || profile?.username || 'Ahmad Al-Hafizh';
  const dailyTarget = profile?.dailyTargetAyahs ?? 10;
  const streak = profile?.currentStreak ?? 3;
  const roleName = profile?.role === 'admin' ? 'Admin / Ustaz' : 'Santri';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dedicated In-App Logged-in Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/app" className="flex items-center space-x-3 group">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                  Hifzhly
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {roleName}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Membantu Menjaga Murojaahmu
              </span>
            </div>
          </Link>

          {/* User Profile & Habit Metrics (REQ-FE-02) */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Name & Daily Target (Dynamic) */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 flex items-center justify-end space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700 inline" />
                <span>{displayName}</span>
              </span>
              <span className="text-[11px] text-slate-500 flex items-center justify-end space-x-1 font-medium">
                <Target className="w-3 h-3 text-slate-400 inline" />
                <span>Target: {dailyTarget} Ayat/Hari</span>
              </span>
            </div>

            {/* Streak Counter (Lucide Flame SVG, No Emojis) */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold"
              title="Konsistensi Murojaah Berturut-turut"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
              <span>{streak} Hari Streak</span>
            </div>

            {/* Back to Public Landing Page */}
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-all hidden sm:flex items-center"
              title="Halaman Depan Publik"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-rose-700 p-2 rounded-xl hover:bg-slate-100 transition-all flex items-center"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Navigation Tabs Bar with Active State */}
        <nav className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-2xl mb-6 text-sm font-medium">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Mic className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Smart Murojaah</span>
            <span className="sm:hidden">Murojaah</span>
          </NavLink>

          <NavLink
            to="/app/mushaf"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Mushaf Digital</span>
            <span className="sm:hidden">Mushaf</span>
          </NavLink>

          <NavLink
            to="/app/tajwid"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Award className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Tajwid Academy</span>
            <span className="sm:hidden">Tajwid</span>
          </NavLink>

          <NavLink
            to="/app/mutabaah"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Mutabaah</span>
            <span className="sm:hidden">Grafik</span>
          </NavLink>
        </nav>

        {/* Dynamic Nested Page Content */}
        <Outlet />
      </main>

      {/* Academic & Islamic Footer */}
      <footer className="border-t border-slate-200/90 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <img src="/hafizhly_panjang.png" alt="Hifzhly" className="h-6 w-auto object-contain" />
            <span className="text-slate-300">|</span>
            <span>Platform Murojaah Al-Qur'an Berbasis AI &amp; Spaced Repetition</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/terms" className="hover:underline hover:text-emerald-700">
              Ketentuan &amp; Privasi
            </Link>
            <span className="text-slate-300">•</span>
            <p>© 2026 Tim FIFA - Untirta</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
