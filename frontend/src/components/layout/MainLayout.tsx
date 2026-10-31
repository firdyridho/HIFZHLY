import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Mic,
  BarChart3,
  Home,
  LogOut,
  GraduationCap,
  ShieldCheck,
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Clean Minimalist Header (Anti-AI-Slop, Emerald Green Islamic Aesthetic) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/app" className="flex items-center space-x-2.5 group shrink-0">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Hifzhly<span className="text-emerald-600 font-black">.</span>
            </span>
          </Link>

          {/* Desktop Minimalist Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </NavLink>

            <NavLink
              to="/app/mushaf"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>Qur'an</span>
            </NavLink>

            <NavLink
              to="/app/murojaah"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Mic className="w-4 h-4" />
              <span>Murojaah</span>
            </NavLink>

            <NavLink
              to="/app/mutabaah"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span>Mutabaah</span>
            </NavLink>

            <NavLink
              to="/app/tajwid"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <GraduationCap className="w-4 h-4" />
              <span>Tajwid</span>
            </NavLink>

            {profile?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </NavLink>
            )}

            {/* Subtle Vertical Divider */}
            <div className="h-5 w-px bg-slate-200 mx-2" />

            {/* Keluar Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </nav>

          {/* Mobile Quick Action */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            <div className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 border-3 border-white group-active:scale-95 transition-all">
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
