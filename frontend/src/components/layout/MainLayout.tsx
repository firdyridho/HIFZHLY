import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Mic,
  BarChart3,
  Home,
  LogOut,
  Flame,
  Target,
  UserCheck,
  GraduationCap,
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

    const handleProfileUpdate = () => {
      const cached = localStorage.getItem('hifzhly_user_profile');
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
        } catch (e) {
          console.error('Failed to parse cached profile:', e);
        }
      }
    };

    window.addEventListener('hifzhly_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('hifzhly_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
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
          <Link to="/app" className="flex items-center space-x-2.5 group shrink-0">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                  Hifzhly
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {roleName}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links in Navbar (User Request: header menu pilihannya taro di navbar ada untuk yg dekstop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </NavLink>

            <NavLink
              to="/app/mushaf"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mushaf</span>
            </NavLink>

            <NavLink
              to="/app/murojaah"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Murojaah</span>
            </NavLink>

            <NavLink
              to="/app/tajwid"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Tajwid</span>
            </NavLink>

            <NavLink
              to="/app/mutabaah"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Mutabaah</span>
            </NavLink>
          </nav>

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
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold shrink-0"
              title="Konsistensi Murojaah Berturut-turut"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
              <span>{streak} Hari <span className="hidden sm:inline">Streak</span></span>
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 pb-28 md:pb-8">
        {/* Dynamic Nested Page Content */}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Matches the User's Design Image) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
          {/* 1. Qur'an */}
          <NavLink
            to="/app/mushaf"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Qur'an</span>
          </NavLink>

          {/* 2. Mutabaah */}
          <NavLink
            to="/app/mutabaah"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Mutabaah</span>
          </NavLink>

          {/* 3. Beranda (Center Elevated Green Floating Action Button) */}
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `-mt-7 flex flex-col items-center group cursor-pointer ${
                isActive ? 'text-emerald-700 font-black' : 'text-slate-600'
              }`
            }
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-3 border-white group-active:scale-95 transition-all">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Beranda</span>
          </NavLink>

          {/* 4. Tajwid */}
          <NavLink
            to="/app/tajwid"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Tajwid</span>
          </NavLink>

          {/* 5. Keluar */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Keluar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
