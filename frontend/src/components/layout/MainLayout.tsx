import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Mic,
  BarChart3,
  Home,
  LogOut,
  GraduationCap,
  AlertCircle,
  RotateCcw,
  Target,
} from 'lucide-react';
import type { UserProfile } from '../../types';

export default function MainLayout() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('hifzhly_user_profile') || localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Active reading check to replace double header
  const isQuranReading = location.pathname.startsWith('/app/mushaf') && (searchParams.has('surah') || searchParams.has('juz'));

  // Auth Guard: Jika tidak ada token (misal setelah logout), dilarang masuk dan wajib login
  const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
  useEffect(() => {
    if (!token) {
      window.location.replace('/login');
    }
  }, [token, location.pathname]);

  // Role Guard: Admin khusus di dashboard admin (/admin), dilarang masuk ke aplikasi santri (/app)
  const userRole = (profile?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'ustadz' || userRole === 'musyrif';

  useEffect(() => {
    if (isAdmin) {
      window.location.replace('/admin');
    }
  }, [isAdmin]);

  useEffect(() => {
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
          if ((data.role as string) === 'admin' || (data.role as string) === 'ustadz' || (data.role as string) === 'musyrif') {
            window.location.replace('/admin');
          }
        })
        .catch(() => {});
    }

    const handleProfileUpdate = () => {
      const cached = localStorage.getItem('hifzhly_user_profile');
      if (cached) {
        try {
          const p = JSON.parse(cached);
          setProfile(p);
          if ((p.role as string) === 'admin' || (p.role as string) === 'ustadz' || (p.role as string) === 'musyrif') {
            window.location.replace('/admin');
          }
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
  }, [token]);

  const executeLogout = () => {
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    // Replace URL ke landing page agar history browser tidak bisa di-back
    window.location.replace('/');
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Clean Minimalist Header (Hidden when actively reading Quran to prevent double headers) */}
      {!isQuranReading && (
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

            {/* Desktop Minimalist Navigation (Murojaah with Mic icon in header, no Hafalan here) */}
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
                to="/app/hafalan"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Mic className="w-4 h-4" />
                <span>Hafalan</span>
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
                <RotateCcw className="w-4 h-4" />
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
                to="/app/target"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Target className="w-4 h-4" />
                <span>Target</span>
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

              {/* Subtle Vertical Divider */}
              <div className="h-5 w-px bg-slate-200 mx-2" />

              {/* Keluar Action (Opens SweetAlert Confirmation Modal) */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
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
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Container */}
      <main className={isQuranReading ? "flex-1 w-full mx-auto p-0 pb-20 md:pb-6" : "flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6 pb-28 md:pb-8"}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Murojaah with Mic in slot 2, Mutabaah in slot 4, Keluar in slot 5) */}
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

          {/* 2. Hafalan */}
          <NavLink
            to="/app/hafalan"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Mic className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Hafalan</span>
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

          {/* 4. Mutabaah */}
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

          {/* 5. Tajwid */}
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
        </div>
      </nav>

      {/* SWEETALERT-STYLE LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowLogoutConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-7 h-7 text-rose-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Konfirmasi Keluar Akun
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin keluar dari Hifzhly? Seluruh progres murojaah, tilawah, dan mutabaah Anda hari ini telah tersimpan aman.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
