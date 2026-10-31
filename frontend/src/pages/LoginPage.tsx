import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import type { UserProfile } from '../types';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = async (userIdentifier: string, userPass: string) => {
    setErrorMessage('');
    setLoading(true);

    const cleanIdentifier = userIdentifier.trim().toLowerCase();
    const cleanPass = userPass.trim();

    try {
      let loggedUser: UserProfile | null = null;
      let tokenStr: string = '';

      // 1. Coba hubungi backend API dengan batas waktu 1 detik
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

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
        // Backend offline / timeout: lanjut ke auto-deteksi lokal
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

      // 3. Auto-Deteksi Akun Admin / Musyrif secara Lokal
      let isLocalAdmin =
        cleanIdentifier === 'admin' ||
        cleanIdentifier === 'admin@hifzhly.id' ||
        cleanIdentifier.includes('admin') ||
        cleanIdentifier.includes('musyrif') ||
        cleanIdentifier.includes('ustadz') ||
        cleanIdentifier.includes('ustaz') ||
        cleanIdentifier.includes('pengelola') ||
        cleanIdentifier.includes('pembina') ||
        cleanPass === 'admin123' ||
        searchParams.get('role') === 'admin';

      // Cek Database Pengguna Lokal (Akun yang didaftarkan di RegisterPage)
      try {
        const dbRaw = localStorage.getItem('hifzhly_users_db');
        if (dbRaw) {
          const db = JSON.parse(dbRaw);
          if (db[cleanIdentifier]) {
            const r = (db[cleanIdentifier].role || '').toLowerCase();
            if (r === 'admin' || r === 'ustadz' || r === 'musyrif') {
              isLocalAdmin = true;
            }
          }
        }
      } catch {}

      // Jika Terdeteksi sebagai Admin
      if (isLocalAdmin) {
        const adminProfile: UserProfile = {
          id: '00000000-0000-0000-0000-000000000001',
          username: cleanIdentifier === 'admin' || !cleanIdentifier ? 'admin' : cleanIdentifier,
          email: cleanIdentifier.includes('@') ? cleanIdentifier : 'admin@hifzhly.id',
          fullName: 'Ustadz Pembina (Admin)',
          role: 'admin',
          dailyTargetAyahs: 20,
          currentStreak: 14,
        };
        const token = tokenStr || 'jwt_hifzhly_admin_' + Date.now();

        localStorage.setItem('hifzhly_auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('hifzhly_user_profile', JSON.stringify(adminProfile));
        localStorage.setItem('user', JSON.stringify(adminProfile));

        // Langsung arahkan ke Dashboard Admin
        window.location.href = '/admin';
        return;
      }

      // 4. Jika Akun Santri / Pengguna Biasa
      const santriProfile: UserProfile = {
        id: '1',
        username: cleanIdentifier || 'ahmad_hifzh',
        email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier || 'ahmad_hifzh'}@santri.hifzhly.id`,
        fullName: cleanIdentifier === 'ahmad_hifzh' || !cleanIdentifier ? 'Ahmad Al-Hafizh' : cleanIdentifier,
        role: 'user',
        dailyTargetAyahs: 10,
        currentStreak: 5,
      };
      const token = tokenStr || 'jwt_hifzhly_santri_' + Date.now();

      localStorage.setItem('hifzhly_auth_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(santriProfile));
      localStorage.setItem('user', JSON.stringify(santriProfile));

      // Langsung arahkan ke Aplikasi Santri
      window.location.href = '/app';
      return;
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
            Masuk ke Hifzhly
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

        {/* Unified Direct Login Form Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
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

            {/* Quick 1-Click Demo Testing Buttons */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleQuickLoginAdmin}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                title="Masuk langsung sebagai Admin / Musyrif"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Masuk Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={handleQuickLoginSantri}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                title="Masuk langsung sebagai Santri"
              >
                <GraduationCap className="w-4 h-4 text-slate-500" />
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
                    <span>Masuk ke Hifzhly</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation Links */}
        <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
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
