import { Link, NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Mic, Award, BarChart3, Home, LogOut } from 'lucide-react';

export default function MainLayout() {
  const handleLogout = () => {
    localStorage.removeItem('hifzhly_auth_token');
    localStorage.removeItem('hifzhly_user_profile');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center space-x-3">
            <img src="/logo saja.png" alt="Hifzhly Logo" className="w-10 h-10 object-contain drop-shadow-xs" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Hifzhly</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  AI Murojaah
                </span>
              </div>
              <p className="text-xs text-slate-500">Membantu Menjaga Murojaahmu</p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-bold">
              <span>🔥 3 Hari Streak</span>
            </div>

            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-all hidden sm:flex items-center space-x-1"
              title="Ke Landing Page"
            >
              <Home className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-700 p-2 rounded-lg hover:bg-slate-100 transition-all flex items-center space-x-1"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Navigation Tabs Bar */}
        <nav className="grid grid-cols-4 gap-2 p-1.5 bg-slate-200/70 rounded-2xl mb-6 text-sm font-semibold">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Murojaah</span>
            <span className="sm:hidden">Murojaah</span>
          </NavLink>

          <NavLink
            to="/app/mushaf"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Mushaf Digital</span>
            <span className="sm:hidden">Mushaf</span>
          </NavLink>

          <NavLink
            to="/app/tajwid"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Tajwid Academy</span>
            <span className="sm:hidden">Tajwid</span>
          </NavLink>

          <NavLink
            to="/app/mutabaah"
            className={({ isActive }) =>
              `flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Mutabaah</span>
            <span className="sm:hidden">Grafik</span>
          </NavLink>
        </nav>

        {/* Dynamic Nested Page Content */}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <img src="/hafizhly_panjang.png" alt="Hifzhly" className="h-6 w-auto object-contain" />
            <span className="text-slate-400">|</span>
            <span>Platform Murojaah Al-Qur'an Berbasis AI & Spaced Repetition</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/terms" className="hover:underline hover:text-emerald-700">
              Ketentuan & Privasi
            </Link>
            <span>•</span>
            <p>© 2026 Tim FIFA - Untirta</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
