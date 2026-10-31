import { useState, useEffect } from 'react';
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
  const [loginPortal, setLoginPortal] = useState<'user' | 'admin'>(() => {
    return searchParams.get('role') === 'admin' ? 'admin' : 'user';
  });

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sinkronkan input demo saat ganti tab jika form masih kosong
  useEffect(() => {
    if (loginPortal === 'admin') {
      if (!identifier || identifier === 'ahmad_hifzh') setIdentifier('admin');
      if (!password || password === 'santri123') setPassword('admin123');
    } else {
      if (identifier === 'admin') setIdentifier('');
      if (password === 'admin123') setPassword('');
    }
    setErrorMessage('');
  }, [loginPortal]);

  const executeLogin = async (userIdentifier: string, userPass: string, portal: 'user' | 'admin') => {
    setErrorMessage('');
    setLoading(true);

    const cleanIdentifier = userIdentifier.trim().toLowerCase();

    try {
      let loggedUser: UserProfile | null = null;
      let tokenStr: string = '';

      // 1. Coba hubungi backend API dengan timeout cepat 800ms
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);

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
        // Backend offline / timeout: lanjut ke penyimpanan lokal
      }

      // 2. Jika Portal ADMIN yang dipilih
      if (portal === 'admin') {
        const adminProfile: UserProfile = loggedUser || {
          id: '00000000-0000-0000-0000-000000000001',
          username: cleanIdentifier === 'admin' ? 'admin' : cleanIdentifier || 'admin',
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

        // Redirect langsung ke Dashboard Admin
        window.location.href = '/admin';
        return;
      }

      // 3. Jika Portal SANTRI yang dipilih
      const santriProfile: UserProfile = loggedUser || {
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

      // Redirect langsung ke Aplikasi Santri
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
    executeLogin(identifier, password, loginPortal);
  };

  const handleFillDemo = () => {
    if (loginPortal === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
      executeLogin('admin', 'admin123', 'admin');
    } else {
      setIdentifier('ahmad_hifzh');
      setPassword('santri123');
      executeLogin('ahmad_hifzh', 'santri123', 'user');
    }
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
            {loginPortal === 'admin'
              ? 'Portal Khusus Asatidz & Musyrif Pembina'
              : 'Portal Murojaah & Hafalan Santri'}
          </p>
        </div>

        {/* 2-Role Tab Switcher: Santri vs Admin */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center border border-slate-200/80 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setLoginPortal('user')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              loginPortal === 'user'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Santri</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginPortal('admin')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              loginPortal === 'admin'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Asatidz / Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              {loginPortal === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Login Dashboard Admin</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Login Aplikasi Santri</span>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
            >
              Isi Demo {loginPortal === 'admin' ? 'Admin' : 'Santri'}
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Username or Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {loginPortal === 'admin' ? 'Username Admin / Asatidz' : 'Username Santri atau Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginPortal === 'admin'
                      ? 'admin atau admin@hifzhly.id'
                      : 'ahmad_hifzh atau email santri'
                  }
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
                  placeholder="Masukkan kata sandi"
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

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer ${
                  loginPortal === 'admin'
                    ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/25'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {loginPortal === 'admin'
                        ? 'Masuk ke Dashboard Admin'
                        : 'Masuk ke Aplikasi Santri'}
                    </span>
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
            <Link
              to={loginPortal === 'admin' ? '/register?role=admin' : '/register?role=user'}
              className="font-bold text-emerald-700 hover:underline"
            >
              Daftar sebagai {loginPortal === 'admin' ? 'Asatidz / Musyrif' : 'Santri Baru'}
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
