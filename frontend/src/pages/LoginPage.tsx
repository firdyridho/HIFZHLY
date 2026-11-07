import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Clock,
} from 'lucide-react';
import type { UserProfile } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export default function LoginPage({ initialMode }: AuthPageProps) {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState<boolean>(
    initialMode === 'register' || location.pathname === '/register'
  );

  // Sync state if initialMode or pathname changes
  useEffect(() => {
    if (initialMode) {
      setIsRegister(initialMode === 'register');
    } else {
      setIsRegister(location.pathname === '/register');
    }
  }, [initialMode, location.pathname]);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Brute Force Lockout Protection States (5 Percobaan Gagal -> Cooldown 30 Detik)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('hifzhly_login_failed_attempts') || '0', 10);
  });
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Monitor Cooldown Countdown Timer
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = parseInt(sessionStorage.getItem('hifzhly_login_lockout_until') || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        const remaining = Math.ceil((lockoutUntil - now) / 1000);
        setLockoutRemaining(remaining);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Check active session
  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
    if (token) {
      try {
        const cached = localStorage.getItem('hifzhly_user_profile') || localStorage.getItem('user');
        const role = cached ? (JSON.parse(cached).role || '').toLowerCase() : '';
        if (role === 'admin' || role === 'ustadz' || role === 'musyrif') {
          window.location.replace('/admin');
        } else {
          window.location.replace('/app');
        }
      } catch {
        window.location.replace('/app');
      }
    }
  }, []);

  const switchMode = (targetRegister: boolean) => {
    setIsRegister(targetRegister);
    setLoginError('');
    setRegError('');
    const newPath = targetRegister ? '/register' : '/login';
    window.history.pushState(null, '', newPath);
  };

  // Execute Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (lockoutRemaining > 0) {
      setLoginError(`Terlalu banyak percobaan gagal. Demi keamanan, silakan tunggu ${lockoutRemaining} detik sebelum mencoba lagi.`);
      return;
    }

    const cleanIdentifier = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanIdentifier || !cleanPass) {
      setLoginError('Username/email dan kata sandi wajib diisi.');
      return;
    }

    setLoginLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: cleanIdentifier,
          password: cleanPass,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Username atau kata sandi tidak valid. Silakan periksa kembali.');
      }

      const loggedUser: UserProfile = data.user;
      const tokenStr: string = data.token;

      if (!loggedUser || !tokenStr) {
        throw new Error('Format respon autentikasi tidak valid dari server.');
      }

      if (cleanIdentifier.toLowerCase() === 'admin' || cleanIdentifier.toLowerCase() === 'admin@hifzhly.id') {
        loggedUser.role = 'admin';
      }

      // Reset counter percobaan gagal saat login berhasil
      sessionStorage.removeItem('hifzhly_login_failed_attempts');
      sessionStorage.removeItem('hifzhly_login_lockout_until');
      setFailedAttempts(0);
      setLockoutRemaining(0);

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
    } catch (err: any) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      sessionStorage.setItem('hifzhly_login_failed_attempts', nextAttempts.toString());

      if (nextAttempts >= 5) {
        const cooldownSeconds = 30;
        const lockoutUntil = Date.now() + cooldownSeconds * 1000;
        sessionStorage.setItem('hifzhly_login_lockout_until', lockoutUntil.toString());
        setLockoutRemaining(cooldownSeconds);
        setLoginError(`Terlalu banyak percobaan login gagal (${nextAttempts} kali). Demi keamanan akun Anda, silakan tunggu 30 detik.`);
      } else {
        const remaining = 5 - nextAttempts;
        const baseMsg = err.name === 'AbortError'
          ? 'Koneksi ke server waktu habis (timeout). Harap periksa jaringan internet Anda.'
          : (err.message || 'Username atau kata sandi tidak valid. Silakan periksa kembali.');
        setLoginError(`${baseMsg} (Percobaan ${nextAttempts}/5. Tersisa ${remaining} kesempatan sebelum jeda 30 detik)`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Execute Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regAgreeTerms) {
      setRegError('Anda wajib menyetujui Ketentuan Layanan & Kebijakan Privasi Suara.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Kata sandi harus memiliki minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setRegLoading(true);

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();
    const effectiveRole =
      cleanUsername === 'admin' || cleanEmail === 'admin@hifzhly.id' ? 'admin' : 'user';

    try {
      let registeredUser: any = null;
      let tokenStr = '';

      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: regFullName.trim(),
            username: regUsername.trim(),
            email: regEmail.trim(),
            password: regPassword,
            role: effectiveRole,
            dailyTargetAyahs: effectiveRole === 'admin' ? 20 : 10,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          registeredUser = data.user;
          tokenStr = data.token;
        } else {
          throw new Error(data.error || 'Pendaftaran gagal, periksa kelengkapan data.');
        }
      } catch (networkOrApiErr: any) {
        if (
          networkOrApiErr.message &&
          !networkOrApiErr.message.includes('fetch') &&
          !networkOrApiErr.message.includes('network')
        ) {
          throw networkOrApiErr;
        }
        // Offline fallback
        registeredUser = {
          id: 'user-' + Date.now(),
          fullName: regFullName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          role: effectiveRole,
          dailyTargetAyahs: effectiveRole === 'admin' ? 20 : 10,
          currentStreak: 0,
          maxStreak: 0,
        };
        tokenStr = 'jwt_hifzhly_' + effectiveRole + '_' + Date.now();
      }

      localStorage.setItem('hifzhly_auth_token', tokenStr);
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(registeredUser));
      localStorage.setItem('user', JSON.stringify(registeredUser));

      if (registeredUser.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/app';
      }
    } catch (err: any) {
      setRegError(err.message || 'Terjadi kesalahan sistem saat mendaftar.');
    } finally {
      setRegLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setLoginIdentifier('admin');
    setLoginPassword('admin123');
  };

  const fillDemoSantri = () => {
    setLoginIdentifier('ahmad_hifzh');
    setLoginPassword('santri123');
  };

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ========================================================
          FULL SCREEN EDGE-TO-EDGE SLIDING CONTAINER (DESKTOP)
         ======================================================== */}
      <div className="hidden lg:block w-full h-screen min-h-[640px] relative overflow-hidden">
        {/* Underneath Two-Column Form Layout (50vw Left | 50vw Right) */}
        <div className="grid grid-cols-2 w-full h-full">
          {/* Left 50% Slot: Register Form (Exposed when isRegister is true) */}
          <div
            className={`w-full h-full flex flex-col justify-between px-14 xl:px-20 py-10 overflow-y-auto transition-all duration-300 ${
              isRegister
                ? 'opacity-100 pointer-events-auto scale-100'
                : 'opacity-0 pointer-events-none scale-95'
            }`}
          >
            {/* Top Back Nav */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-slate-500 hover:text-emerald-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Beranda</span>
              </Link>
              <span className="text-[11px] text-slate-400">Pendaftaran Santri</span>
            </div>

            {/* Form Content */}
            <div className="max-w-md w-full mx-auto my-auto space-y-5">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Daftar Akun Baru
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Mulai perjalanan hafalan Al-Qur'an yang terukur dan ilmiah
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="leading-snug font-medium">{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Nama lengkap santri atau pembina"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Username unik"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="regTermsDesktop"
                    checked={regAgreeTerms}
                    onChange={(e) => setRegAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="regTermsDesktop" className="text-xs text-slate-500 leading-tight cursor-pointer">
                    Saya menyetujui{' '}
                    <Link to="/terms" className="font-semibold text-emerald-700 hover:underline">
                      Ketentuan Layanan &amp; Kebijakan Privasi Suara
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer mt-2"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Santri</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Note */}
            <div className="text-[11px] text-slate-400 text-center">
              Platform Evaluasi Murojaah Mandiri • Standar Kemenag RI
            </div>
          </div>

          {/* Right 50% Slot: Login Form (Exposed when isRegister is false) */}
          <div
            className={`w-full h-full flex flex-col justify-between px-14 xl:px-20 py-10 overflow-y-auto transition-all duration-300 ${
              !isRegister
                ? 'opacity-100 pointer-events-auto scale-100'
                : 'opacity-0 pointer-events-none scale-95'
            }`}
          >
            {/* Top Back Nav */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-slate-500 hover:text-emerald-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Beranda</span>
              </Link>
              <span className="text-[11px] text-slate-400">Portal Masuk</span>
            </div>

            {/* Form Content */}
            <div className="max-w-md w-full mx-auto my-auto space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Masuk ke Hifzhly
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Akses ruang murojaah hafalan mandiri santri maupun monitoring asatidz
                </p>
              </div>

              {loginError && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 border ${
                    lockoutRemaining > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {lockoutRemaining > 0 ? (
                    <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <p className="leading-snug font-semibold">
                      {lockoutRemaining > 0 ? 'Proteksi Keamanan Aktif' : 'Autentikasi Gagal'}
                    </p>
                    <p className="leading-snug">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Contoh: ahmad_hifzh atau admin"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akunmu"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Clean 1-Click Demo Testing Buttons (Zero Badges) */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Akses Pengujian Cepat:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={fillDemoAdmin}
                      className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Admin Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={fillDemoSantri}
                      className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                      <span>Santri Demo</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading || lockoutRemaining > 0}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer pt-2"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : lockoutRemaining > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Terkunci Sementara ({lockoutRemaining}s)</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Hifzhly</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Note */}
            <div className="text-[11px] text-slate-400 text-center">
              Platform Evaluasi Murojaah Mandiri • Standar Kemenag RI
            </div>
          </div>
        </div>

        {/* ========================================================
            FULL-HEIGHT SLIDING OVERLAY PANEL (50vw Width, 100vh Height)
           ======================================================== */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-1/2 h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-14 xl:p-20 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 shadow-2xl ${
            isRegister ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Subtle Watermark Islamic Typography */}
          <div
            className="absolute -right-16 -bottom-16 font-quran text-[18rem] text-emerald-500/5 select-none pointer-events-none leading-none"
            dir="rtl"
            aria-hidden="true"
          >
            حفظ
          </div>

          {/* Top Logo & Title */}
          <div className="relative z-10 flex items-center space-x-3">
            <img src="/logo saja.png" alt="Hifzhly" className="w-10 h-10 object-contain drop-shadow-md" />
            <div>
              <span className="font-black tracking-tight text-white text-xl block leading-none">Hifzhly</span>
              <span className="text-[10px] text-emerald-400 font-medium">Asisten Murojaah Cerdas</span>
            </div>
          </div>

          {/* Center Quranic Quotes with High-Contrast Islamic Typography */}
          <div className="relative z-10 space-y-6 my-auto max-w-lg">
            {isRegister ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="font-quran text-4xl leading-loose text-right text-emerald-200" dir="rtl">
                  بَلْ هُوَ ءَايَٰتٌۢ بَيِّنَٰتٌ فِى صُدُورِ ٱلَّذِينَ أُوتُوا۟ ٱلْعِلْمَ
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/50 pl-4 font-serif">
                  "Sebenarnya, Al-Qur'an itu adalah ayat-ayat yang nyata di dalam dada orang-orang yang diberi ilmu."
                </p>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
                  QS. Al-'Ankabut [29: 49]
                </span>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="font-quran text-4xl leading-loose text-right text-emerald-200" dir="rtl">
                  وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/50 pl-4 font-serif">
                  "Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?"
                </p>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
                  QS. Al-Qamar [54: 17]
                </span>
              </div>
            )}
          </div>

          {/* Bottom Switch Trigger (Clean & Slop-Free) */}
          <div className="relative z-10 pt-6 border-t border-emerald-800/40">
            {isRegister ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Sudah memiliki akun santri?</span>
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="px-5 py-2.5 rounded-xl border border-emerald-500/40 hover:bg-emerald-900/60 text-white text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Belum memiliki akun Hifzhly?</span>
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className="px-5 py-2.5 rounded-xl border border-emerald-500/40 hover:bg-emerald-900/60 text-white text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Daftar Santri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          FULL SCREEN MOBILE VIEW (< lg Screen)
         ======================================================== */}
      <div className="lg:hidden min-h-screen w-full flex flex-col justify-between p-6 sm:p-8 bg-white">
        {/* Top Header & Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img src="/logo saja.png" alt="Hifzhly" className="w-6 h-6 object-contain" />
              <span className="font-extrabold text-slate-900 text-sm">Hifzhly</span>
            </div>
          </div>

          {/* Clean Segmented Controller */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Mobile Form Body */}
        <div className="my-auto py-6">
          {isRegister ? (
            /* Mobile Register Form */
            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Daftar Akun Baru</h1>
                <p className="text-xs text-slate-500 mt-0.5">Mulai hafalan Al-Qur'an terukur</p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="leading-snug">{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="regTermsMobile"
                    checked={regAgreeTerms}
                    onChange={(e) => setRegAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <label htmlFor="regTermsMobile" className="text-[11px] text-slate-500 leading-tight">
                    Menyetujui Ketentuan Layanan &amp; Privasi Suara Hifzhly.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Santri</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Mobile Login Form */
            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Masuk ke Hifzhly</h1>
                <p className="text-xs text-slate-500 mt-0.5">Akses ruang murojaah hafalan mandiri</p>
              </div>

              {loginError && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start space-x-2 border ${
                    lockoutRemaining > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {lockoutRemaining > 0 ? (
                    <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <p className="leading-snug font-semibold text-[11px]">
                      {lockoutRemaining > 0 ? 'Proteksi Keamanan Aktif' : 'Autentikasi Gagal'}
                    </p>
                    <p className="leading-snug text-[11px]">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Username atau Email</label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan username atau email"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Subtle Demo Buttons */}
                <div className="pt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Admin Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoSantri}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1 hover:bg-slate-50"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Santri Demo</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading || lockoutRemaining > 0}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer pt-1"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : lockoutRemaining > 0 ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Terkunci Sementara ({lockoutRemaining}s)</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Hifzhly</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Bottom Note */}
        <div className="text-[11px] text-slate-400 text-center pt-4">
          Hifzhly © 2026 Tim FIFA • Standar Kemenag RI
        </div>
      </div>
    </div>
  );
}
