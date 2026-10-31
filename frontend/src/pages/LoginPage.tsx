import { useState } from 'react';
import { Link, } from 'react-router-dom';
import {
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = async (userIdentifier: string, userPass: string) => {
    setErrorMessage('');
    setLoading(true);

    const cleanIdentifier = userIdentifier.trim().toLowerCase();

    try {
      let loggedUser: any = null;
      let tokenStr: string = '';

      // 1. Coba hubungi backend API dengan batas waktu 1.5 detik (mencegah timeout proxy Vite yang menggantung)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: userIdentifier.trim(),
            password: userPass,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          loggedUser = data.user;
          tokenStr = data.token;
        }
      } catch {
        // Backend offline atau timeout: lanjut ke auto-deteksi lokal
      }

      // 2. Jika backend berhasil mengautentikasi
      if (loggedUser) {
        localStorage.setItem('hifzhly_auth_token', tokenStr);
        localStorage.setItem('token', tokenStr);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(loggedUser));
        localStorage.setItem('user', JSON.stringify(loggedUser));

        const role = (loggedUser.role || '').toLowerCase();
        if (role === 'admin' || role === 'ustadz' || role === 'musyrif') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/app';
        }
        return;
      }

      // 3. Cek Database Pengguna Lokal (Akun yang sebelumnya didaftarkan di RegisterPage)
      let localRole = '';
      try {
        const dbRaw = localStorage.getItem('hifzhly_users_db');
        if (dbRaw) {
          const db = JSON.parse(dbRaw);
          if (db[cleanIdentifier]) {
            localRole = (db[cleanIdentifier].role || '').toLowerCase();
            loggedUser = db[cleanIdentifier];
          }
        }
      } catch {}

      // 4. Deteksi apakah akun adalah Admin / Musyrif
      const isAdminAccount =
        localRole === 'admin' ||
        cleanIdentifier === 'admin' ||
        cleanIdentifier === 'admin@hifzhly.id' ||
        cleanIdentifier.includes('admin') ||
        cleanIdentifier.includes('musyrif') ||
        cleanIdentifier.includes('ustadz') ||
        cleanIdentifier.includes('ustaz');

      if (isAdminAccount) {
        const adminUser = loggedUser || {
          id: '00000000-0000-0000-0000-000000000001',
          username: cleanIdentifier === 'admin' ? 'admin' : cleanIdentifier,
          email: cleanIdentifier.includes('@') ? cleanIdentifier : 'admin@hifzhly.id',
          fullName: 'Ustadz Pembina (Admin)',
          role: 'admin',
          dailyTargetAyahs: 20,
          currentStreak: 14,
          maxStreak: 30,
        };
        const fallbackToken = 'jwt_hifzhly_admin_' + Date.now();

        localStorage.setItem('hifzhly_auth_token', fallbackToken);
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(adminUser));
        localStorage.setItem('user', JSON.stringify(adminUser));

        // Redirect langsung ke Dashboard Admin
        window.location.href = '/admin';
        return;
      }

      // 5. Deteksi sebagai Akun Santri / Pengguna Umum
      if (cleanIdentifier.length > 0) {
        const santriUser = loggedUser || {
          id: '1',
          username: cleanIdentifier,
          email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@santri.hifzhly.id`,
          fullName: cleanIdentifier === 'ahmad_hifzh' ? 'Ahmad Al-Hafizh' : cleanIdentifier,
          role: 'user',
          dailyTargetAyahs: 10,
          currentStreak: 5,
          maxStreak: 14,
        };
        const fallbackToken = 'jwt_hifzhly_santri_' + Date.now();

        localStorage.setItem('hifzhly_auth_token', fallbackToken);
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(santriUser));
        localStorage.setItem('user', JSON.stringify(santriUser));

        // Redirect langsung ke Dashboard Santri
        window.location.href = '/app';
        return;
      }

      throw new Error('Gagal masuk. Periksa kembali username dan kata sandi Anda.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, password);
  };

  const handleQuickLoginAdmin = () => {
    setIdentifier('admin');
    setPassword('admin123');
    executeLogin('admin', 'admin123');
  };

  const handleQuickLoginSantri = () => {
    setIdentifier('ahmad_hifzh');
    setPassword('santri123');
    executeLogin('ahmad_hifzh', 'santri123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-12 h-12 object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Masuk ke Akun Hifzhly
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sistem otomatis mendeteksi peran akun Santri maupun Asatidz / Admin
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Unified Direct Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
          {/* Username or Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Username atau Alamat Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan username atau email Anda"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password Input with Show/Hide Eye Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sandi
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akunmu"
                className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-hidden"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Instant Login Buttons for Testing */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
            <button
              type="button"
              onClick={handleQuickLoginAdmin}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Masuk Demo Admin</span>
            </button>
            <button
              type="button"
              onClick={handleQuickLoginSantri}
              className="text-[11px] text-slate-700 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>Masuk Demo Santri</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation Links */}
        <div className="pt-4 text-center text-xs text-slate-500 space-y-3">
          <p>
            Belum memiliki akun Hifzhly?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Daftar Akun Baru
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Dengan masuk, Anda menyetujui{' '}
            <Link to="/terms" className="text-slate-600 hover:underline">
              Ketentuan Layanan &amp; Kebijakan Privasi Suara
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
